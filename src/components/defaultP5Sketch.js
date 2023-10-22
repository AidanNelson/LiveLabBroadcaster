const jsValue = `
function setup() {
    createCanvas(400, 400);
  }
  
  function draw() {
    background(220);
}
`;

export const myFiles = [
  {
    name: "style.css",
    language: "css",
    value: `html, body {
        margin: 0;
        padding: 0;
      }
      canvas {
        display: block;
      }
      `,
  },
  {
    name: "index.html",
    language: "html",
    value: `<!DOCTYPE html>
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
      </html>
      `,
  },
  {
    name: "script.js",
    language: "javascript",
    value: jsValue,
  },
];
