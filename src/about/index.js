// global variables

let socket
let peers = {}
let frameCount = 0
let visibleInteractions = {
  mouse: false,
}

// set up a loop which will repeat 60 times per second
function loop() {
  frameCount++

  // emit updates to our mouse position here (at whichever frequency makes sense)
  if (frameCount % 30) {
    socket.emit('mousePosition', mousePosition)
  }

  // text-based interaction
  for (let i = fallingKeys.length - 1; i >= 0; i--) {
    const key = fallingKeys[i]
    const isAlive = key.update()
    if (!isAlive) {
      fallingKeys.splice(i, 1)
    }
  }

  window.requestAnimationFrame(loop)
}

function handleInteractions(msg) {
  switch (msg.type) {
    case 'realTimeText':
      console.log(msg.data)
      newFallingKeyXPosition += 14
      if (newFallingKeyXPosition > window.innerWidth) {
        newFallingKeyXPosition = 0
      }
      fallingKeys.push(new FallingKey(msg.data, newFallingKeyXPosition))
      break

    default:
      console.log('not sure how to handle this: ', msg)
  }
}

// ~*~ // ~*~ // ~*~ // ~*~ // ~*~ // ~*~ // ~*~ // ~*~ // ~*~ // ~*~ //

/*
Mouse Interactions
This code relates to sharing mouse position.
*/
// our mouse position
let mousePosition = { x: -100, y: -100 }

// add mouse button interaction
let mouseButton = document.getElementById('mouseInteractionButton')

mouseButton.addEventListener('click', (ev) => {
  visibleInteractions.mouse = !visibleInteractions.mouse
  for (let id in peers) {
    peers[id].cursor.toggleVisibility(visibleInteractions.mouse)
  }
  mouseButton.innerText = visibleInteractions.mouse ? 'Hide 🐭!' : 'Show 🐭!'
  console.log('currently visible interactions: ', visibleInteractions)
})

// update our mouse position whenever we move the pointern
document.addEventListener('pointermove', (ev) => {
  mousePosition = { x: ev.pageX, y: ev.pageY }
})

// update based on data from server
function updateMousePositions(data) {
  for (let id in data) {
    const mousePosition = data[id].mousePosition
    if (!(id in peers)) continue
    const cursor = peers[id].cursor
    cursor.move(mousePosition)
  }
}

// visualization for a remove mouse cursor
class MouseCursor {
  constructor() {
    this.el = document.createElement('p')

    this.el.innerText = '🐭'

    // apply some styling
    this.el.style.position = 'absolute'
    this.el.style.width = '12px'
    this.el.style.height = '12px'

    // set it outside of the visible frame until we have an updated position
    this.el.style.top = '-100 px'
    this.el.style.left = '-100 px'

    // add it to the body
    document.body.appendChild(this.el)
    this.toggleVisibility(false)
  }

  move(position) {
    // put it in position
    this.el.style.top = position.y + 'px'
    this.el.style.left = position.x + 'px'
  }

  toggleVisibility(visible) {
    this.el.style.display = visible ? 'block' : 'none'
  }

  remove() {
    document.body.removeChild(this.el)
  }
}

// Set up everything we need for a new peer
function createPeer() {
  return { cursor: new MouseCursor() }
}

// ~*~ // ~*~ // ~*~ // ~*~ // ~*~ // ~*~ // ~*~ // ~*~ // ~*~ // ~*~ //
/*
Voice & Video Interaction

*/
let localCam
let mediaRecorder = null
let chunks = []

let recordMessageButton = document.getElementById('voiceInteractionButton')

recordMessageButton.addEventListener('mousedown', (ev) => {
  console.log('starting to record')
  if (mediaRecorder) {
    mediaRecorder.start()
    console.log(mediaRecorder.state)
    console.log('recorder started')
    recordMessageButton.style.background = 'red'
    recordMessageButton.style.color = 'black'
  }
})

recordMessageButton.addEventListener('mouseup', (ev) => {
  console.log('sending recording')
  if (mediaRecorder) {
    mediaRecorder.stop()
    console.log(mediaRecorder.state)
    console.log('recorder stopped')
    recordMessageButton.style.background = ''
    recordMessageButton.style.color = ''
  }
})

//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//
// user media

const videoElement = document.getElementById('local_video')
const audioInputSelect = document.querySelector('select#audioSource')
const audioOutputSelect = document.querySelector('select#audioOutput')
const videoInputSelect = document.querySelector('select#videoSource')
const selectors = [audioInputSelect, audioOutputSelect, videoInputSelect]

audioOutputSelect.disabled = !('sinkId' in HTMLMediaElement.prototype)

audioInputSelect.addEventListener('change', startStream)
videoInputSelect.addEventListener('change', startStream)
audioOutputSelect.addEventListener('change', changeAudioDestination)

async function getDevices() {
  let devicesInfo = await navigator.mediaDevices.enumerateDevices()
  gotDevices(devicesInfo)
  await startStream()
}
getDevices()

function gotDevices(deviceInfos) {
  // Handles being called several times to update labels. Preserve values.
  const values = selectors.map((select) => select.value)
  selectors.forEach((select) => {
    while (select.firstChild) {
      select.removeChild(select.firstChild)
    }
  })
  for (let i = 0; i !== deviceInfos.length; ++i) {
    const deviceInfo = deviceInfos[i]
    const option = document.createElement('option')
    option.value = deviceInfo.deviceId
    if (deviceInfo.kind === 'audioinput') {
      option.text =
        deviceInfo.label || `microphone ${audioInputSelect.length + 1}`
      audioInputSelect.appendChild(option)
    } else if (deviceInfo.kind === 'audiooutput') {
      option.text =
        deviceInfo.label || `speaker ${audioOutputSelect.length + 1}`
      audioOutputSelect.appendChild(option)
    } else if (deviceInfo.kind === 'videoinput') {
      option.text = deviceInfo.label || `camera ${videoInputSelect.length + 1}`
      videoInputSelect.appendChild(option)
    } else {
      console.log('Some other kind of source/device: ', deviceInfo)
    }
  }
  selectors.forEach((select, selectorIndex) => {
    if (
      Array.prototype.slice
        .call(select.childNodes)
        .some((n) => n.value === values[selectorIndex])
    ) {
      select.value = values[selectorIndex]
    }
  })
}

function gotStream(stream) {
  localCam = stream // make stream available to console

  cameraPaused = false
  micPaused = false
  // updateCameraPausedButton();
  // updateMicPausedButton();

  const videoTrack = localCam.getVideoTracks()[0]
  const audioTrack = localCam.getAudioTracks()[0]

  let videoStream = new MediaStream([videoTrack])
  if ('srcObject' in videoElement) {
    videoElement.srcObject = videoStream
  } else {
    videoElement.src = window.URL.createObjectURL(videoStream)
  }

  videoElement.play()

  mediaRecorder = new MediaRecorder(stream)
  mediaRecorder.onstop = (e) => {
    console.log('data available after MediaRecorder.stop() called.')

    const clipName = prompt('Enter a name for your sound clip')

    const clipContainer = document.createElement('article')
    const clipLabel = document.createElement('p')
    const audio = document.createElement('audio')
    const deleteButton = document.createElement('button')

    clipContainer.classList.add('clip')
    audio.setAttribute('controls', '')
    deleteButton.textContent = 'Delete'
    clipLabel.textContent = clipName

    clipContainer.appendChild(audio)
    clipContainer.appendChild(clipLabel)
    clipContainer.appendChild(deleteButton)
    document.body.appendChild(clipContainer)

    audio.controls = true
    const blob = new Blob(chunks, { type: 'audio/ogg; codecs=opus' })
    chunks = []
    const audioURL = URL.createObjectURL(blob)
    console.log(audioURL)
    audio.src = audioURL
    console.log('recorder stopped')

    deleteButton.onclick = (e) => {
      const evtTgt = e.target
      evtTgt.parentNode.parentNode.removeChild(evtTgt.parentNode)
    }
  }

  mediaRecorder.ondataavailable = (e) => {
    chunks.push(e.data)
  }

  // mediasoupPeer.addTrack(videoTrack, "video");
  // mediasoupPeer.addTrack(audioTrack, "audio");

  // Refresh button list in case labels have become available
  return navigator.mediaDevices.enumerateDevices()
}

function handleError(error) {
  console.log(
    'navigator.MediaDevices.getUserMedia error: ',
    error.message,
    error.name
  )
}

// Attach audio output device to video element using device/sink ID.
function attachSinkId(element, sinkId) {
  if (typeof element.sinkId !== 'undefined') {
    element
      .setSinkId(sinkId)
      .then(() => {
        console.log(`Success, audio output device attached: ${sinkId}`)
      })
      .catch((error) => {
        let errorMessage = error
        if (error.name === 'SecurityError') {
          errorMessage = `You need to use HTTPS for selecting audio output device: ${error}`
        }
        console.error(errorMessage)
        // Jump back to first output device in the list as it's the default.
        audioOutputSelect.selectedIndex = 0
      })
  } else {
    console.warn('Browser does not support output device selection.')
  }
}

function changeAudioDestination() {
  const audioDestination = audioOutputSelect.value
  attachSinkId(videoElement, audioDestination)
}

async function startStream() {
  console.log('getting local stream')
  if (localCam) {
    localCam.getTracks().forEach((track) => {
      track.stop()
    })
  }

  const audioSource = audioInputSelect.value
  const videoSource = videoInputSelect.value
  const constraints = {
    audio: { deviceId: audioSource ? { exact: audioSource } : undefined },
    video: {
      deviceId: videoSource ? { exact: videoSource } : undefined,
      width: { ideal: 320 },
      height: { ideal: 240 },
    },
  }
  navigator.mediaDevices
    .getUserMedia(constraints)
    .then(gotStream)
    .then(gotDevices)
    .catch(handleError)
}

//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//

function pauseVideo() {
  if (!localCam) return
  localCam.getVideoTracks()[0].enabled = false
  cameraPaused = true

  updateCameraPausedButton()
}

function resumeVideo() {
  if (!localCam) return
  localCam.getVideoTracks()[0].enabled = true
  cameraPaused = false

  updateCameraPausedButton()
}

function pauseMic() {
  if (!localCam) return
  localCam.getAudioTracks()[0].enabled = false
  micPaused = true

  updateMicPausedButton()
}

function resumeMic() {
  if (!localCam) return
  localCam.getAudioTracks()[0].enabled = true
  micPaused = false

  updateMicPausedButton()
}

/*
Text Interaction
*/
let newFallingKeyXPosition = 0
const fallingKeys = []
const textInput = document.getElementById('textInteractionInput')

textInput.addEventListener('keypress', (ev) => {
  console.log(textInput.value)
  console.log(ev)
  socket.emit('interaction', { type: 'realTimeText', data: ev.key })
})

class FallingKey {
  constructor(text, xPosition) {
    this.el = document.createElement('p')

    this.lifeForce = 1000 + Math.random() * 1000
    this.position = {
      x: xPosition,
      y: -100,
    }

    // choose a random image for this box
    // this.el.src = mouseImageURLs[0];
    this.el.innerText = text

    // apply some styling
    this.el.style.position = 'absolute'
    this.el.style.width = '12px'
    this.el.style.height = '12px'

    // set it outside of the visible frame until we have an updated position
    let top = this.position.y + 'px'
    let left = this.position.x + 'px'
    this.el.style.top = top
    this.el.style.left = left

    // add it to the body
    document.body.appendChild(this.el)
  }

  update() {
    // fall from the sky
    this.position.y += 1

    // set it outside of the visible frame until we have an updated position
    let top = this.position.y + 'px'
    let left = this.position.x + 'px'
    this.el.style.top = top
    this.el.style.left = left

    this.lifeForce--
    if (this.lifeForce < 0) {
      this.remove()
      return false
    } else {
      return true
    }
  }

  remove() {
    document.body.removeChild(this.el)
  }
}

// ~*~ // ~*~ // ~*~ // ~*~ // ~*~ // ~*~ // ~*~ // ~*~ // ~*~ // ~*~ //
// Speech Recognition
const SpeechRecognition = window.SpeechRecognition || webkitSpeechRecognition
const SpeechGrammarList = window.SpeechGrammarList || webkitSpeechGrammarList
const SpeechRecognitionEvent =
  window.SpeechRecognitionEvent || webkitSpeechRecognitionEvent

const recognition = new SpeechRecognition()

recognition.continuous = true
recognition.lang = 'en-US'
recognition.interimResults = true
recognition.maxAlternatives = 1

let voiceInteractionButton = document.getElementById('voiceInteractionButton')

voiceInteractionButton.addEventListener('mousedown', () => {
  recognition.start()
  voiceInteractionButton.innerHTML = 'RECORDING'
  console.log('starting recognition')
})

voiceInteractionButton.addEventListener('mouseup', () => {
  recognition.stop()
  voiceInteractionButton.innerHTML = 'CLICK TO RECORD'
  console.log('stopping recognition')
})
recognition.onresult = (event) => {
  let result = event.results[event.results.length - 1][0]
  console.log(result.transcript)
}

// ~*~ // ~*~ // ~*~ // ~*~ // ~*~ // ~*~ // ~*~ // ~*~ // ~*~ // ~*~ //
/*
Initialization
This function establishes a socket connection with the server and sets up event handlers for various incoming socket messages
*/

window.onload = () => {
  console.log('~~~~~~~~~~~~~~~~~')

  if (window.location.hostname === 'venue.itp.io') {
    socket = io('https://venue.itp.io')
  } else {
    socket = io('http://localhost:3131')
  }
  socket.on('connection', () => {
    console.log('connected!')
    loop()
  })

  // generic interaction socket event for ease of setting up new interactions
  // new interactions should be set up as follows: {type: 'myEventType', data: myCoolData}
  socket.on('interaction', (msg) => {
    handleInteractions(msg)
  })

  //     socket.on("oscForSockets", (data) => {
  //       console.log("Message Received from OSC: ", data);
  //       if (data[0] == "/cue/action/1") {
  //         let params = `scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,
  //   width=200,height=200,left=200,top=200`;

  //         open("/popup", "test", params);
  //       }
  //     });

  socket.on('clients', (ids) => {
    console.log('Got initial clients!')
    for (const id of ids) {
      if (!(id in peers)) {
        console.log('Client conencted: ', id)
        peers[id] = createPeer()
      }
    }
  })

  socket.on('clientConnected', (id) => {
    console.log('Client conencted: ', id)
    peers[id] = createPeer()
  })

  socket.on('clientDisconnected', (id) => {
    console.log('Client disconencted:', id)
    if (!(id in peers)) return
    peers[id].cursor.remove()
    delete peers[id]
  })

  // socket handler for mouse position info from the server
  socket.on('mousePositions', (data) => {
    updateMousePositions(data)
  })
}
