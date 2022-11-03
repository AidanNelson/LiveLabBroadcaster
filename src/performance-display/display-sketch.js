var ss;
let result;

function showResult()
{
  console.log(foo.resultString); // log the result
}

function setup() {
  // 16 x 9
  createCanvas(1600, 900);

  ss = new p5.Speech(); // speech synthesis object

  socket.on('speech',speechResult);
}

function speechResult(result)
{  
  console.log(result)
  ss.speak(result);
}

function draw() {
  background(0,10);
  fill(200);
  textSize(20);
  textAlign(LEFT);
  text(result, random(width), random(height));
}

