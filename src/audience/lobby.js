

export class Lobby {
    constructor() {
        document.addEventListener('pointerdown', (e) => this.onPointerDown(e));
        document.addEventListener('pointermove', (e) => this.onPointerMove(e));
        document.addEventListener('pointerup', (e) => this.onPointerUp(e));


        this.frameCount = 0;
        this.update();
    }

    onPointerDown(ev) {
        console.log('pointer down');
        this.pointerdown = true;
    }

    onPointerMove(ev) {
        if (this.pointerdown) {
            console.log(ev.clientX + "/" + ev.clientY);
        }
    }

    onPointerUp(ev) {
        console.log('pointer up');
        this.pointerdown = false;


    }

    addPeer(id) {

    }

    addVideo(id, track) {

    }

    addAudio(id, track) {

    }

    updatePeers() {
        for (let id in window.peers) {
            console.log('id:', window.peers[id]);
            if (peers[id].videoEl){
                this.setElementPosition(peers[id].videoEl,20,50)
            }
        }
    }

    setElementPosition(element, x,y){
        element.style.top = `${y}px`;
        element.style.left = `${x}px`;
    }

    update() {
        this.frameCount++;

        if (this.frameCount % 50 === 0) {
            this.updatePeers();
        }

        window.requestAnimationFrame(() => this.update());
    }

    // connectToClosestPeers(peers) {
    //     let closestPeers = this.getClosestPeers(8);
    //     // ensure we have all of these peers connected
    //     for (const peerId of closestPeers) {
    //         simpleMediasoupPeer.connectToPeer(peerId);
    //     }

    //     // then pause all other peers:
    //     for (const peerId in clients) {
    //         if (closestPeers.includes(peerId)) {
    //             simpleMediasoupPeer.resumePeer(peerId);
    //         } else {
    //             simpleMediasoupPeer.pausePeer(peerId);
    //         }
    //     }
    // }
}