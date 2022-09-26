import * as THREE from "three";

export class Lobby {
  constructor(peers, socket) {
    this.paused = true;
    this.peers = peers;
    this.socket = socket;
    // this pauses or restarts rendering and updating
    this.domElement = document.getElementById("lobby-container");
    this.mySocketID = 0;
    this.frameCount = 0;
    this.hyperlinkedObjects = []; // array to store interactable hyperlinked meshes
    this.width = this.domElement.offsetWidth;
    this.height = this.domElement.offsetHeight;

    console.log(this.width);
    console.log(this.height);

    this.textureLoader = new THREE.TextureLoader();

    // standard peer mat
    let peerImageURL = new URL("./assets/grass.jpg", import.meta.url);
    let peerTex = this.textureLoader.load(peerImageURL);
    this.standardPeerMat = new THREE.MeshBasicMaterial({ map: peerTex });

    this.scene = new THREE.Scene();
    this.raycaster = new THREE.Raycaster();

    // audio variables:
    this.distanceThresholdSquared = 500;
    this.rolloffNumerator = 1;

    this.playerHeight = 1 + Math.random();

    //THREE Camera
    this.frustumSize = 10;
    const width = 3;
    const height = 100;
    this.camera = new THREE.OrthographicCamera(
      width / -2,
      width / 2,
      height / 2,
      height / -2,
      1,
      1000
    );

    this.minFrustumSize = 2;
    this.maxFrustumSize = 40;
    // store mouse positions
    this.mouse = new THREE.Vector2();

    // Add a ground

    // grass texture
    let imgURL = new URL("./assets/grass.jpg", import.meta.url);
    let grassTex = this.textureLoader.load(imgURL);
    grassTex.wrapS = THREE.RepeatWrapping;
    grassTex.wrapT = THREE.RepeatWrapping;
    grassTex.repeat.set(10, 10);
    let groundGeo = new THREE.PlaneGeometry(100, 100);
    let groundMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      map: grassTex,
    });
    this.ground = new THREE.Mesh(groundGeo, groundMat);
    this.ground.rotateX(-Math.PI / 2);
    this.scene.add(this.ground);
    this.ground.layers.enable(2);

    // Set the starting position
    this.cameraHeight = 10;
    this.camera.position.set(0, this.cameraHeight, 0);

    // create an AudioListener and add it to the camera
    // this.listener = new THREE.AudioListener();
    // this.camera.add(this.listener);
    this.scene.add(this.camera);

    this.camera.lookAt(new THREE.Vector3(0, 0, 0));

    window.camera = this.camera;

    //THREE WebGL renderer
    this.renderer = new THREE.WebGLRenderer({
      antialiasing: true,
      alpha: true,
    });
    // this.renderer.shadowMap.enabled = true;
    // this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    // this.renderer.setClearColor(new THREE.Color('lightblue')); // change sky color
    this.renderer.setSize(this.width, this.height);
    //Push the canvas to the DOM
    this.domElement.append(this.renderer.domElement);
    this.renderer.domElement.style.padding = 0;

    this.onWindowResize();

    //Setup event listeners for events and handle the states
    window.addEventListener("resize", (e) => this.onWindowResize(e), false);

    // Helpers
    // this.helperGrid = new THREE.GridHelper(100, 100);
    // this.helperGrid.position.y = 0.5; // offset the grid down to avoid z fighting with floor
    // this.scene.add(this.helperGrid);

    this.addSelf();

    this.domElement.addEventListener("pointerdown", (e) =>
      this.onPointerDown(e)
    );
    this.domElement.addEventListener("pointermove", (e) =>
      this.onPointerMove(e)
    );
    this.domElement.addEventListener("pointerup", (e) => this.onPointerUp(e));

    this.keys = {};
    document.addEventListener(
      "keydown",
      (ev) => {
        this.keys[ev.key] = true;
      },
      false
    );
    document.addEventListener(
      "keyup",
      (ev) => {
        this.keys[ev.key] = false;
      },
      false
    );

    this.renderer.domElement.addEventListener(
      "wheel",
      (e) => this.onMouseWheel(e),
      { passive: false }
    );

    this.targetZoomPosition = null;
  }

  //==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//
  // Clients 👫

  addSelf() {
    let videoMaterial = makeVideoMaterial("local");
    let geo = new THREE.CircleGeometry(0.5, 32);
    let _head = new THREE.Mesh(geo, videoMaterial);
    _head.rotateX(-Math.PI / 2);

    // const ringGeo = new THREE.RingGeometry(0.5, 0.55, 24);
    // const ringMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
    // const ring = new THREE.Mesh(ringGeo, ringMat);
    // ring.rotateX(Math.PI/2);

    // https://threejs.org/docs/index.html#api/en/objects/Group
    this.playerGroup = new THREE.Group();
    this.playerGroup.add(_head);
    // this.playerGroup.add(ring);
    this.playerGroup.position.set(
      (Math.random() - 0.5) * 10,
      1,
      (Math.random() - 0.5) * 10
    );

    // add group to scene
    this.scene.add(this.playerGroup);

    this.updateCameraAndRenderer();
  }

  // add a client meshes, a video element and  canvas for three.js video texture
  addPeer(id) {
    // let _body = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1, 0.5), new THREE.MeshNormalMaterial());

    // let mat = new THREE.MeshBasicMaterial({ color: 0xcccccc });
    // let videoMaterial = makeVideoMaterial(id);

    let geo = new THREE.CircleGeometry(0.5, 24);

    let _head = new THREE.Mesh(geo, this.standardPeerMat);
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

    this.peers[id].group = group;
    this.peers[id].videoMesh = _head;
    this.peers[id].desiredPosition = new THREE.Vector3();
    this.peers[id].desiredSize = new THREE.Vector3(1, 1, 1);
  }

  removePeer(id) {
    this.scene.remove(this.peers[id].group);
    delete this.peers[id];
  }

  onMouseWheel(ev) {
    if (ev.deltaY < 0) {
      this.dollyIn();
    } else if (ev.deltaY > 0) {
      this.dollyOut();
    }
  }

  dollyIn() {
    this.frustumSize -= 0.5;

    if (this.frustumSize < this.minFrustumSize) {
      this.frustumSize = this.minFrustumSize;
    }

    this.updateCameraAndRenderer();
  }
  dollyOut() {
    this.frustumSize += 0.5;
    if (this.frustumSize > this.maxFrustumSize) {
      this.frustumSize = this.maxFrustumSize;
    }
    this.updateCameraAndRenderer();
  }

  onPointerDown(ev) {
    // console.log('pointer down');
    this.pointerdown = true;
  }

  onPointerMove(ev) {
    // calculate mouse position in normalized device coordinates
    // (-1 to +1) for both components
    this.mouse.x = (ev.clientX / this.domElement.offsetWidth) * 2 - 1;
    this.mouse.y = -(ev.clientY / this.domElement.offsetHeight) * 2 + 1;
  }

  onPointerUp(ev) {
    // console.log('pointer up');
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

      this.peers[id].videoMesh.material = videoMaterial;
      this.peers[id].videoElement = videoElement;
    }
  }

  addAudioToPeer(id) {
    let audioElement = document.getElementById(id + "_audio");
    if (audioElement) {
      this.peers[id].audioElement = audioElement;
    }
  }

  updateClientPositions(peerData) {
    for (let id in peerData) {
      if (id in this.peers) {
        this.peers[id].desiredPosition.set(
          peerData[id].position[0],
          peerData[id].position[1],
          peerData[id].position[2]
        );
        this.peers[id].desiredSize.set(
          peerData[id].size,
          peerData[id].size,
          peerData[id].size
        );
      }
    }
  }

  updatePositions() {
    let snapDistance = 0.5;
    for (let id in this.peers) {
      if (this.peers[id].group) {
        this.peers[id].group.scale.lerp(this.peers[id].desiredSize, 0.01);
        this.peers[id].group.position.lerp(this.peers[id].desiredPosition, 0.1);
        if (
          this.peers[id].group.position.distanceTo(
            this.peers[id].desiredPosition
          ) < snapDistance
        ) {
          this.peers[id].group.position.set(
            this.peers[id].desiredPosition.x,
            this.peers[id].desiredPosition.y,
            this.peers[id].desiredPosition.z
          );
        }
      }
    }
  }

  getPlayerPosition() {
    return [
      this.playerGroup.position.x,
      this.playerGroup.position.y,
      this.playerGroup.position.z,
    ];
  }

  keyboardControls() {
    let speed = 0.01;
    // console.log(this.keys);
    let currentScale = this.playerGroup.scale.x;
    let newScale = currentScale * 1.0075;

    if (newScale > 4) {
      newScale = 4;
    }
    let newScaleDown = currentScale * 0.995;
    if (newScaleDown < 1) {
      newScaleDown = 1;
    }

    // spacebar interaction
    if (this.keys[" "]) {
      this.playerGroup.scale.set(newScale, newScale, newScale);
    } else {
      this.playerGroup.scale.set(newScaleDown, newScaleDown, newScaleDown);
    }

    if (this.keys["w"]) {
      this.playerGroup.position.z -= speed;
    }
    if (this.keys["s"]) {
      this.playerGroup.position.z += speed;
    }
    if (this.keys["a"]) {
      this.playerGroup.position.x -= speed;
    }
    if (this.keys["d"]) {
      this.playerGroup.position.x += speed;
    }

    if (this.keys["ArrowDown"]) {
      this.playerGroup.position.z += speed;
    }
    if (this.keys["ArrowUp"]) {
      this.playerGroup.position.z -= speed;
    }
    if (this.keys["ArrowLeft"]) {
      this.playerGroup.position.x -= speed;
    }
    if (this.keys["ArrowRight"]) {
      this.playerGroup.position.x += speed;
    }
  }
  update() {
    if (this.paused) return;
    this.frameCount++;

    // console.log(this.keys);
    this.keyboardControls();

    if (this.pointerdown) {
      // update the picking ray with the camera and pointer position
      this.raycaster.setFromCamera(this.mouse, this.camera);
      this.raycaster.layers.set(2);

      // calculate objects intersecting the picking ray
      const intersects = this.raycaster.intersectObject(this.ground);

      if (intersects.length > 0) {
        let pt = intersects[0].point;
        pt.y = this.playerHeight;
        this.playerGroup.position.lerp(pt, 0.01);
      }
    }

    // keep player in frame of camera
    let cameraViewBounds = this.maxFrustumSize / 2;

    const minCamX = -1 * cameraViewBounds - this.camera.left;
    const maxCamX = cameraViewBounds - this.camera.right;
    const minCamZ = -1 * cameraViewBounds - this.camera.bottom;
    const maxCamZ = cameraViewBounds - this.camera.top;

    let pt = this.playerGroup.position.clone();
    pt.y = this.cameraHeight;
    pt.x = Math.min(maxCamX, Math.max(minCamX, pt.x));
    pt.z = Math.min(maxCamZ, Math.max(minCamZ, pt.z));
    this.camera.position.lerp(pt, 0.05);

    if (this.frameCount % 20 == 0) {
      this.updateClientVolumes();
    }
    if (this.frameCount % 50 == 0) {
      this.socket.emit("move", this.getPlayerPosition());
      this.socket.emit("size", this.playerGroup.scale.x);
    }

    this.updatePositions(); // other users
    this.render();

    window.requestAnimationFrame(() => this.update());
  }

  stop() {
    this.paused = true;
    this.renderer.clear();
  }

  start() {
    this.paused = false;
    this.onWindowResize();
    this.update();
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
    for (let id in this.peers) {
      if (this.peers[id].audioElement) {
        let distSquared = this.playerGroup.position.distanceToSquared(
          this.peers[id].group.position
        );

        // from lucasio here: https://discourse.threejs.org/t/positionalaudio-setmediastreamsource-with-webrtc-question-not-hearing-any-sound/14301/29
        let volume = Math.min(1, this.rolloffNumerator / distSquared);
        this.peers[id].audioElement.volume = volume;
      }
    }
  }

  getClosestPeers(maximumPeers = 10) {
    let distancesSquared = {};
    let peerIDs = [];
    for (let id in this.peers) {
      let distSquared = this.camera.position.distanceToSquared(
        this.peers[id].group.position
      );
      if (distSquared <= this.distanceThresholdSquared) {
        peerIDs.push(id);
        distancesSquared[id] = distSquared;
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

    this.updateCameraAndRenderer();
  }

  updateCameraAndRenderer() {
    const aspect = this.width / this.height;

    this.camera.left = (-this.frustumSize * aspect) / 2;
    this.camera.right = (this.frustumSize * aspect) / 2;
    this.camera.top = this.frustumSize / 2;
    this.camera.bottom = -this.frustumSize / 2;

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
