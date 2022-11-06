var ss;
var sr;
let result;

function setup() {
  createCanvas(1, 1);

  sr = new p5.SpeechRec(); // speech recognition object (will prompt for mic access)
  sr.onResult = speechResult; // bind callback function to trigger when speech is recognized

  sr.continuous = true; // do continuous recognition
  sr.interimResults = true; // allow partial recognition (faster, less accurate)

  sr.start(); // start listening
}

function speechResult() {
  result = sr.resultString;
  console.log(result);
  socket.emit("speech", result);
}

function draw() {}
