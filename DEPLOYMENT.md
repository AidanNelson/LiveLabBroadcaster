# LiveLab Broadcaster — Production Deployment Guide

This guide covers deploying a self-hosted LiveKit server for LiveLab Broadcaster, a single-room theatre broadcast setup supporting 1-5 broadcasters and 2-500 guests.

## Prerequisites

- **Domain** you own, with the ability to add DNS subdomains (one for LiveKit, one for TURN)
- **SSL certificate** from a trusted Certificate Authority — self-signed certificates will not work with WebRTC
- **Compute-optimized VM** with 8+ vCPU (e.g. GCP `c2-standard-8`, AWS `c5.2xlarge`). 16 vCPU recommended for 500-guest events with multiple broadcasters
- **10 Gbps NIC or faster** — egress is the bottleneck. Typical event bandwidth is 420-840 Mbps; worst case with simulcast is ~3.5 Gbps
- **Redis** — recommended even for single-node production

## Quick Start with `livekit/generate`

LiveKit provides a Docker-based configuration generator that produces a complete production setup with Caddy (for automatic TLS), Docker Compose, and Redis:

```bash
docker pull livekit/generate
docker run --rm -it -v$PWD:/output livekit/generate
```

This creates a folder with your domain name containing:

| File                    | Purpose                                          |
|-------------------------|--------------------------------------------------|
| `caddy.yaml`            | Reverse proxy with automatic SSL via Let's Encrypt |
| `docker-compose.yaml`   | Orchestrates LiveKit, Caddy, and Redis           |
| `livekit.yaml`          | LiveKit server configuration                     |
| `redis.conf`            | Redis configuration                              |
| `init_script.sh`        | Startup script for VM deployment                 |
| `cloud_init.*.yaml`     | Cloud-init script (AWS, Azure, DigitalOcean)     |

### Deploy via Cloud-Init (AWS, Azure, DigitalOcean)

Paste the contents of `cloud_init.*.yaml` into your VM's **User Data** field when launching. The machine will self-configure on boot.

### Deploy via Init Script (GCP, Linode, other)

1. Start a VM (Ubuntu recommended)
2. Copy `init_script.sh` to the VM
3. SSH in and run `sudo ./init_script.sh`

The script installs Docker, Docker Compose, places config at `/opt/livekit`, and creates a `livekit-docker` systemd service.

```bash
# manage the service
systemctl start livekit-docker
systemctl stop livekit-docker
systemctl status livekit-docker
```

## LiveKit Configuration (`livekit.yaml`)

Below is the recommended production configuration. Replace placeholder values with your own.

```yaml
port: 7880
log_level: info

rtc:
  tcp_port: 7881
  port_range_start: 50000
  port_range_end: 60000
  # Required for cloud VMs where the public IP is not bound to the process.
  # LiveKit uses STUN to discover the true IP and advertises it to clients.
  use_external_ip: true

redis:
  address: localhost:6379

keys:
  # Replace with a strong, unique API key and secret.
  # NEVER use the dev defaults (devkey/secret) in production.
  YOUR_API_KEY: YOUR_API_SECRET

turn:
  enabled: true
  domain: turn.yourdomain.com
  # If not using a load balancer, set to 443
  tls_port: 3478
  cert_file: /path/to/turn.crt
  key_file: /path/to/turn.key

# Uncomment to expose Prometheus metrics
# prometheus_port: 6789
```

**Important:** The `--dev` flag uses well-known credentials (`devkey`/`secret`) and must never be used in production.

## DNS

Both domains must have A records pointing to your server's public IP:

| Record                   | Points to         |
|--------------------------|-------------------|
| `livekit.yourdomain.com` | Server public IP  |
| `turn.yourdomain.com`    | Server public IP  |

Caddy will not provision TLS certificates until DNS is correctly configured.

## Firewall / Ports

The following ports must be open on your cloud provider's firewall and any instance-level firewall:

| Port             | Protocol | Purpose                                      |
|------------------|----------|----------------------------------------------|
| `443`            | TCP      | HTTPS signaling + TURN/TLS                   |
| `80`             | TCP      | TLS certificate issuance (Let's Encrypt)     |
| `7881`           | TCP      | ICE/TCP fallback (for clients behind NAT/VPN)|
| `3478`           | UDP      | TURN/UDP                                     |
| `50000-60000`    | UDP      | ICE/UDP media (each participant uses 2 ports)|

### AWS Security Groups

Add inbound rules for each port/range above. For the UDP range, specify `50000-60000` as a custom UDP rule with source `0.0.0.0/0`.

### GCP Firewall Rules

Create a firewall rule allowing ingress on the ports above, targeting your LiveKit VM's network tag.

### Instance-level Firewall (if enabled)

```bash
sudo firewall-cmd --zone public --permanent --add-port 80/tcp
sudo firewall-cmd --zone public --permanent --add-port 443/tcp
sudo firewall-cmd --zone public --permanent --add-port 7881/tcp
sudo firewall-cmd --zone public --permanent --add-port 443/udp
sudo firewall-cmd --zone public --permanent --add-port 50000-60000/udp
sudo firewall-cmd --reload
```

## System Tuning

### File Descriptors

Each WebRTC connection uses multiple file descriptors. Increase the limit:

```bash
ulimit -n 65535
```

To persist across reboots, add to `/etc/security/limits.conf`:

```
*  soft  nofile  65535
*  hard  nofile  65535
```

### Docker Host Networking

For optimal performance, LiveKit should use host networking in Docker:

```yaml
# in docker-compose.yaml
services:
  livekit:
    network_mode: host
```

This avoids Docker's network bridge overhead for high-throughput UDP traffic.

## Capacity Planning

LiveLab is a single-room theatre broadcast. Only one event runs at a time.

### Reference Benchmark (Official)

On a 16 vCPU `c2-standard-16` (GCP), LiveKit handles:

| Scenario       | Publishers | Subscribers | CPU  | Egress    |
|----------------|-----------|-------------|------|-----------|
| Audio only     | 10        | 3,000       | 80%  | 23 MBps   |
| Large meeting  | 150       | 150         | 85%  | 93 MBps   |
| Livestreaming  | 1         | 3,000       | 92%  | 531 MBps  |

### LiveLab-Specific Estimates

Per broadcaster stream: 3 Mbps video (720p30) + 128 Kbps audio = ~3.1 Mbps

| Scenario                          | Broadcasters | Guests | Peak Egress (high layer) | Estimated with Simulcast |
|-----------------------------------|-------------|--------|--------------------------|--------------------------|
| Typical event                     | 1-2         | 300    | 930-1,860 Mbps           | 420-840 Mbps             |
| Large event                       | 3-5         | 500    | 4.65-7.75 Gbps           | 1.5-3.5 Gbps             |

With simulcast, most viewers receive the mid or low layer (~1.0-1.4 Mbps per stream), significantly reducing egress.

### VM Sizing Recommendation

| Event size                        | Recommended VM              |
|-----------------------------------|-----------------------------|
| 1-2 broadcasters, up to 300 guests | 8 vCPU (c5.2xlarge / c2-standard-8) |
| 3-5 broadcasters, up to 500 guests | 16 vCPU (c5.4xlarge / c2-standard-16) |

Each room must fit on a single node — self-hosted LiveKit cannot shard a room across multiple servers.

## Environment Variables

The Next.js application and Node.js Socket.IO server require these environment variables:

```env
# LiveKit
LIVEKIT_API_KEY=your_production_api_key
LIVEKIT_API_SECRET=your_production_api_secret
NEXT_PUBLIC_LIVEKIT_SERVER_URL=wss://livekit.yourdomain.com

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Socket.IO server
NEXT_PUBLIC_REALTIME_SERVER_ADDRESS=https://your-socketio-server.com
```

## Load Testing

Install the [LiveKit CLI](https://github.com/livekit/livekit-cli) and run load tests from a **separate** machine with adequate CPU, bandwidth, and file descriptors.

### Typical Event (1 broadcaster, 300 guests)

```bash
lk load-test \
  --url wss://livekit.yourdomain.com \
  --api-key YOUR_KEY \
  --api-secret YOUR_SECRET \
  --room load-test \
  --video-publishers 1 \
  --subscribers 300
```

### Worst Case (5 broadcasters, 500 guests)

```bash
lk load-test \
  --url wss://livekit.yourdomain.com \
  --api-key YOUR_KEY \
  --api-secret YOUR_SECRET \
  --room load-test \
  --video-publishers 5 \
  --subscribers 500
```

Ensure the load test machine also has `ulimit -n 65535` set.

## Upgrading LiveKit

To upgrade to a new LiveKit release:

```bash
# Option 1: Pin a specific version
# Edit /opt/livekit/docker-compose.yaml, change image to:
#   livekit/livekit-server:v<VERSION>

# Option 2: Use latest
docker pull livekit/livekit-server:latest
cd /opt/livekit
docker-compose up -d
```

## Troubleshooting

### Check Service Status

```bash
systemctl status livekit-docker
cd /opt/livekit
docker-compose logs
```

### Verify TLS Certificates

Look for this line in Caddy logs:

```
livekit-caddy-1 | {"level":"info","ts":...,"logger":"tls.obtain","msg":"certificate obtained successfully","identifier":"livekit.yourdomain.com"}
```

If missing, your server is not reachable from the internet — check DNS and firewall.

### Verify DNS

```bash
host livekit.yourdomain.com
host turn.yourdomain.com
```

Both should resolve to your server's public IP.

### Quick Connectivity Test

From your server:

```bash
curl http://localhost:7880
```

Should return a response (not hang). If it hangs, check instance-level firewall rules.

### Cloud-Init Issues (AWS/EC2)

If the instance started before networking was ready:

```bash
sudo cloud-init clean --logs
sudo reboot now
```
