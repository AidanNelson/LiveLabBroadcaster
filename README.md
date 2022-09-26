This repository contains a templated codebase for a virtual venue. The goal of this project is to provide arts and educational organizations with a starting place for building their own web-based venues for live performances and virtual events.

This project was started to support a live performance incubated at [CultureHub](https://www.culturehub.org/) in Spring 2022.

# Getting Started

This guide assumes some familiarity with your the command line (a text-based interface for your computer) and with web-development technologies. So when you see blocks of code below, these should be entered into your MacOS Terminal 💻 or Windows/Linux equivalent.

```sh
# download this repository and change directory (cd) into the root folder
git clone https://github.com/AidanNelson/virtual-venue.git
cd virtual-venue

# install all dependencies on the front end
npm install

# start the front-end development server
npm run watch

# You should now be able to access the venue from your web-browser at http://localhost:1234/

```

In order to actually use this application, however, you will need to start the back-end server in a separate terminal

```sh
# enter into the /server folder and install all dependencies
# note that this may take several minutes as it will compile the Mediasoup package
cd server
npm install

# create certificates for local development (only required once)
# this will automatically set the country code to US.  Feel free to change if you like
# you may be able to ignore all other parameters
openssl req -new -newkey rsa:4096 -days 365 -nodes -x509 -subj "/C=US" -keyout certs/key.pem -out certs/cert.pem

# once everything has been installed, start the server from the root of the repository
cd ..
npm run start-server



```

# Customizing for Your Needs

The code is organized into a few different sections:

## Server

The backend Node.js server code is contained within the `/server` folder. The server manages all real-time communications between audience members and the showrunners.

## Front End

There are several web pages available in the front-end. These are available at the following paths.

[Audience](./src/) - This is where audience members will enter into your virtual venue.

[Show Control](./src/show-control/) - This is where you will control the show, move between scenes and otherwise affect the audience experience. Think of this page as home-base for a stage manager.

[Broadcaster](./src/broadcaster/) - This page allows a live performer or showrunner to broadcast to the audience using WebRTC broadcasting.

[Feed](./src/feed/) - This page displays a simple view of the current broadcast from the broadcaster, for testing and recording purposes.

## Technologies at Play

Here is a run down of some of the core technologies which enable this virtual venue to exist.

### WebSockets

### WebRTC

### WebGL

# To Do:

### Server:

- [ ] - Switch server to use HTTPS

### Broadcaster:

- [ ] - Use highest quality streams

### Admin:

- [ ] - Show currently active streams
- [ ] - Show # of current audience members?

### Client:

- [ ] - Handle scene switching on client side
- [ ] - How to handle switching between streams
- [ ] - Can we handle dissolve or other filtering on videos? (i.e. https://www.curtainsjs.com/examples/multiple-video-textures/index.html)
- [ ] - close Mediasoup Streams at end of lobby
- [ ] - check which quality streams are being sent
