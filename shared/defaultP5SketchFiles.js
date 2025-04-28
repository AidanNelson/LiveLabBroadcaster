const htmlValue = `<!DOCTYPE html>
<html lang="en">

<head>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.7.0/p5.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.7.0/addons/p5.sound.min.js"></script>
  <link rel="stylesheet" type="text/css" href="style.css">
  <meta charset="utf-8" />

</head>

<body>
  <main>
  </main>
  <script src="sketch.js"></script>
</body>

</html>`;

const cssValue = `html,
body {
  margin: 0;
  padding: 0;
  overflow: hidden;
}

canvas {
  display: block;
}`;

const jsValue = `function setup() {
  createCanvas(windowWidth, windowHeight);

}

function draw() {
  fill(255, 0, 0);
  rect(width - 50, height - 50, 50, 50);
}


function windowResized() {
  resizeCanvas(windowWidth, windowHeight)
}`;

export const defaultP5SketchFiles = [
  {
    name: "style.css",
    language: "css",
    value: cssValue,
  },
  {
    name: "index.html",
    language: "html",
    value: htmlValue,
  },
  {
    name: "script.js",
    language: "javascript",
    value: jsValue,
  },
];
