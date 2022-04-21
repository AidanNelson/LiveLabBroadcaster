
    let socket;
    let mediasoupPeer;

    function main() {
        console.log("~~~~~~~~~~~~~~~~~");
        socket = io("localhost:5000", {
            path: "/socket.io"
        });

        mediasoupPeer = new SimpleMediasoupPeer(socket);
        mediasoupPeer.on('track', gotTrack);
    }


    function gotTrack(track, id, label) {
        console.log(`Got track of kind ${label} from ${id}`);
        let el = document.getElementById("video");
        if (track.kind === "video") {
            console.log("Updating video source for client with ID: " + id);
            el.srcObject = null;
            el.srcObject = new MediaStream([track]);

            el.onloadedmetadata = (e) => {
                el.play().catch((e) => {
                    console.log("Play video error: " + e);
                });
            };
        }
        if (track.kind === "audio") {

            console.log("Updating <audio> source object for client with ID: " + id);
            el.srcObject = null;
            el.srcObject = new MediaStream([track]);

            el.onloadedmetadata = (e) => {
                el.play().catch((e) => {
                    console.log("Play audio error: " + e);
                });
            };
        }
    }

    const startButton = document.getElementById('startButton');
    startButton.addEventListener('click', () => {
        main()
        startButton.disabled = true;
    }, false);

