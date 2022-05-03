import * as THREE from "three";

export class Lobby {
    constructor(socket) {
        this.socket = socket;
        // this pauses or restarts rendering and updating
        this.domElement = document.getElementById('stage-container');
        this.clients = {};
        this.mySocketID = 0;
        this.frameCount = 0;
        this.hyperlinkedObjects = []; // array to store interactable hyperlinked meshes
        this.width = this.domElement.offsetWidth;
        this.height = this.domElement.offsetHeight;


        this.scene = new THREE.Scene();
        this.raycaster = new THREE.Raycaster();

        // audio variables:
        this.distanceThresholdSquared = 500;
        this.rolloffNumerator = 5;

        this.playerHeight = 1;

        // STATS for debugging:
        // this.stats = new Stats();
        // document.body.appendChild(this.stats.dom);
        // this.stats.dom.style = 'visibility: hidden';
        // this.stats.dom.id = 'stats';

        //THREE Camera
        this.frustumSize = 10;
        const width = 100;
        const height = 100;
        this.camera = new THREE.OrthographicCamera(width / - 2, width / 2, height / 2, height / - 2, 1, 1000);


        // store mouse positions
        this.mouse = new THREE.Vector2();


        // Add a ground
        let groundGeo = new THREE.PlaneGeometry(100, 100);
        let groundMat = new THREE.MeshBasicMaterial();
        this.ground = new THREE.Mesh(groundGeo, groundMat);
        this.ground.rotateX(-Math.PI / 2);
        this.scene.add(this.ground);
        this.ground.layers.set(2);


        // Set the starting position
        this.camera.position.set(0, 10, 0);


        // create an AudioListener and add it to the camera
        // this.listener = new THREE.AudioListener();
        // this.camera.add(this.listener);
        this.scene.add(this.camera);

        this.camera.lookAt(new THREE.Vector3(0, 0, 0));

        window.camera = this.camera;

        //THREE WebGL renderer
        this.renderer = new THREE.WebGLRenderer({
            antialiasing: true,
            alpha: true
        });
        // this.renderer.shadowMap.enabled = true;
        // this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        // this.renderer.setClearColor(new THREE.Color('lightblue')); // change sky color
        this.renderer.setSize(this.width, this.height);
        //Push the canvas to the DOM
        this.domElement.append(this.renderer.domElement);
        this.renderer.domElement.style.padding=0;

        this.onWindowResize();




        //Setup event listeners for events and handle the states
        window.addEventListener('resize', (e) => this.onWindowResize(e), false);

        // Helpers
        this.helperGrid = new THREE.GridHelper(100, 100);
        this.helperGrid.position.y = 0.5; // offset the grid down to avoid z fighting with floor
        this.scene.add(this.helperGrid);

        this.update();
        this.render();

        this.addSelf();



        document.addEventListener('pointerdown', (e) => this.onPointerDown(e));
        document.addEventListener('pointermove', (e) => this.onPointerMove(e));
        document.addEventListener('pointerup', (e) => this.onPointerUp(e));


    }

    //==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//
    // Clients 👫

    addSelf() {
        let videoMaterial = makeVideoMaterial('local');
        let geo = new THREE.CircleGeometry(0.5, 24);
        let _head = new THREE.Mesh(geo, videoMaterial);
        _head.rotateX(-Math.PI / 2);

        // https://threejs.org/docs/index.html#api/en/objects/Group
        this.playerGroup = new THREE.Group();
        this.playerGroup.add(_head);

        this.playerGroup.position.set(5, 1, 0);

        // add group to scene
        this.scene.add(this.playerGroup);
    }

    // add a client meshes, a video element and  canvas for three.js video texture
    addPeer(_id) {
        // let _body = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1, 0.5), new THREE.MeshNormalMaterial());

        let mat = new THREE.MeshBasicMaterial();
        // let videoMaterial = makeVideoMaterial(_id);

        let geo = new THREE.CircleGeometry(0.5, 24);

        let _head = new THREE.Mesh(geo, mat);
        _head.rotateX(-Math.PI / 2);

        // const ringGeo = new THREE.RingGeometry(0.75, 0.85, 4);
        // const ringMat = new THREE.MeshBasicMaterial({ color: 0xffff00, side: THREE.DoubleSide });
        // const _ring = new THREE.Mesh(ringGeo, ringMat);
        // _ring.rotateOnAxis(new THREE.Vector3(0, 0, 1), Math.PI / 4);

        // set position of head before adding to parent object
        // _body.position.set(0, 0, 0);
        // _head.position.set(0, 1, 0);
        // _ring.position.set(0, 1, 0.51);

        // https://threejs.org/docs/index.html#api/en/objects/Group
        var group = new THREE.Group();
        // group.add(_body);
        group.add(_head);
        // group.add(_ring);

        // add group to scene
        this.scene.add(group);

        console.log('Adding client to scene: ' + _id);

        this.clients[_id] = {};
        this.clients[_id].group = group;
        this.clients[_id].mesh = _head;
        this.clients[_id].desiredPosition = new THREE.Vector3();
        // this.clients[_id].desiredRotation = new THREE.Quaternion();
        // this.clients[_id].desiredLookAt = new THREE.Vector3();
        // this.clients[_id].projectionScreenId = -1;
    }

    removePeer(_id) {
        this.scene.remove(this.clients[_id].group);
        delete this.clients[_id];
    }

    onPointerDown(ev) {
        console.log('pointer down');
        this.pointerdown = true;
    }

    onPointerMove(ev) {
        // calculate mouse position in normalized device coordinates
        // (-1 to +1) for both components
        this.mouse.x = (ev.clientX / this.domElement.offsetWidth) * 2 - 1;
        this.mouse.y = -(ev.clientY / this.domElement.offsetHeight) * 2 + 1;
    }

    onPointerUp(ev) {
        console.log('pointer up');
        this.pointerdown = false;
    }

    addVideoToPeer(id) {

        let videoElement = document.getElementById(id + "_video");

        if (videoElement) {
            let videoTexture = new THREE.VideoTexture(videoElement);

            let videoMaterial = new THREE.MeshBasicMaterial({
                map: videoTexture,
                side: THREE.DoubleSide,
            });

            this.clients[id].mesh.material = videoMaterial;
            this.clients[id].videoElement = videoElement;
        }



    }

    addAudioToPeer(id) {
        let audioElement = document.getElementById(id + "_audio");
        if (audioElement) {
            this.clients[id].audioElement = audioElement;
        }
    }


    // overloaded function can deal with new info or not
    updateClientPositions(_clientProps) {

        for (let _id in _clientProps) {
            if (_id in this.clients) {
                if (_id != this.mySocketID) {
                    this.clients[_id].desiredPosition = new THREE.Vector3(_clientProps[_id].position[0], _clientProps[_id].position[1], _clientProps[_id].position[2]);
                }
            }
        }
    }


    updatePositions() {
        let snapDistance = 0.5;
        for (let _id in this.clients) {
            if (this.clients[_id].group) {
                this.clients[_id].group.position.lerp(this.clients[_id].desiredPosition, 0.2);
                if (this.clients[_id].group.position.distanceTo(this.clients[_id].desiredPosition) < snapDistance) {
                    this.clients[_id].group.position.set(this.clients[_id].desiredPosition.x, this.clients[_id].desiredPosition.y, this.clients[_id].desiredPosition.z);
                }
            }
        }
    }

    getPlayerPosition() {
        return [this.playerGroup.position.x, this.playerGroup.position.y, this.playerGroup.position.z];
    }

    update() {
        this.frameCount++;

        if (this.pointerdown) {
            // update the picking ray with the camera and pointer position
            this.raycaster.setFromCamera(this.mouse, this.camera);
            this.raycaster.layers.set(2);

            // calculate objects intersecting the picking ray
            const intersects = this.raycaster.intersectObject(this.ground);
            // console.log(intersects);

            if (intersects.length > 0) {
                let pt = intersects[0].point;
                pt.y = this.playerHeight;
                this.playerGroup.position.lerp(pt, 0.01);
                // this.camera.position.x = pt.x;
                // this.camera.position.z = pt.z;
            }
        }

        if (this.frameCount % 20 == 0) {
            this.updateClientVolumes();


        }
        if (this.frameCount % 50 == 0) {
            this.socket.emit('move', this.getPlayerPosition());
        }



        // this.stats.update();
        this.updatePositions(); // other users
        this.render();

        window.requestAnimationFrame(() => this.update());
    }



    //==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//
    //==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//
    // Rendering 🎥

    render() {
        this.renderer.render(this.scene, this.camera);
    }


    //==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//
    //==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//
    // Audio 📣

    updateClientVolumes() {
        for (let _id in this.clients) {
            if (this.clients[_id].audioElement) {
                let distSquared = this.playerGroup.position.distanceToSquared(this.clients[_id].group.position);

                // from lucasio here: https://discourse.threejs.org/t/positionalaudio-setmediastreamsource-with-webrtc-question-not-hearing-any-sound/14301/29
                let volume = Math.min(1, this.rolloffNumerator / distSquared);
                this.clients[_id].audioElement.volume = volume;
            }
        }
    }

    getClosestPeers(maximumPeers = 10) {
        let distancesSquared = {};
        let peerIDs = [];
        for (let _id in this.clients) {
            let distSquared = this.camera.position.distanceToSquared(this.clients[_id].group.position);
            if (distSquared <= this.distanceThresholdSquared) {
                peerIDs.push(_id);
                distancesSquared[_id] = distSquared;
            }
        }
        peerIDs.sort((peerA, peerB) => {
            if (distancesSquared[peerA] < distancesSquared[peerB]) {
                return -1;
            }
            return 1;

        });
        peerIDs = peerIDs.slice(0, maximumPeers - 1);
        return peerIDs;
    }

    //==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//
    //==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//
    // Event Handlers 🍽

    onWindowResize(e) {
        this.width = this.domElement.offsetWidth;
        this.height = this.domElement.offsetHeight;


        const aspect = this.width / this.height;



        this.camera.left = - this.frustumSize * aspect / 2;
        this.camera.right = this.frustumSize * aspect / 2;
        this.camera.top = this.frustumSize / 2;
        this.camera.bottom = - this.frustumSize / 2;

        this.camera.updateProjectionMatrix();

        this.renderer.setSize(this.width, this.height);
    }
}



function makeVideoMaterial(id) {
    let videoElement = document.getElementById(id + "_video");
    let videoTexture = new THREE.VideoTexture(videoElement);

    let videoMaterial = new THREE.MeshBasicMaterial({
        map: videoTexture,
        side: THREE.DoubleSide,
    });

    return videoMaterial;
}