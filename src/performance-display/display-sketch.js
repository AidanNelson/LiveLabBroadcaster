var ss
let result
let x = 100
let y = 100

function showResult() {
  console.log(foo.resultString) // log the result
}

function setup() {
  // 16 x 9
  createCanvas(window.innerWidth, window.innerHeight)

  //ss = new p5.Speech(); // speech synthesis object

  if (process.env.environment == 'dev') {
    socket = io('http://localhost:3131', {
      path: '/socket.io',
    })
  } else {
    socket = io('https://venue.itp.io', {
      path: '/socket.io',
    })
  }

  socket.on('speech', speechResult)

  document.addEventListener('keyup', (ev) => {
    if (ev.key == 1) {
      console.log('sending go command')
      socket.emit('osc', '/go')
    }
  })
}

function speechResult(newResult) {
  console.log(newResult)
  //ss.speak(newResult);
  result = newResult
  x = random(width)
  y = random(height)
}

function draw() {
  background(0, 1)
  if (frameCount % 60 == 0) {
  }
  fill(200)
  textSize(20)
  textAlign(LEFT)
  text(result, x, y)
}
