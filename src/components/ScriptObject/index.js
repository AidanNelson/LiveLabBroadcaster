import { useEffect, useRef, useState } from "react";

// TODO follow this to properly resolve scripts: https://github.com/processing/p5.js-web-editor/blob/362b5537896371542a91f68568e4d5300bc6acab/client/modules/Preview/EmbedFrame.jsx#L207
const getGeneratedPageURL = ({ html, css, js }) => {
  const getBlobURL = (code, type) => {
    const blob = new Blob([code], { type });
    return URL.createObjectURL(blob);
  };

  const cssURL = getBlobURL(css, "text/css");
  const jsURL = getBlobURL(js, "text/javascript");

  const source = `
    <html>
      <head>
        ${css && `<link rel="stylesheet" type="text/css" href="${cssURL}" />`}
        ${js && `<script src="${jsURL}"></script>`}
        <meta name="color-scheme" content="dark light">
      </head>
      <body>
        ${html || ""}
      </body>
    </html>
  `;
  return getBlobURL(source, "text/html");
};

export const ScriptableObject = ({ scriptableObjectData }) => {
  const frameRef = useRef();
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    frameRef.current.contentWindow.addEventListener(
      "mousemove",
      function (event) {
        var clRect = frameRef.current.getBoundingClientRect();
        var evt = new CustomEvent("mousemove", {
          bubbles: true,
          cancelable: false,
        });

        evt.clientX = event.clientX + clRect.left;
        evt.clientY = event.clientY + clRect.top;

        frameRef.current.contentWindow.parent.dispatchEvent(evt);
      },
    );
  }, []);

  useEffect(() => {
    console.log(scriptableObjectData.active);
  }, [scriptableObjectData]);

  useEffect(() => {
    console.log("refreshing scriptableObject");
    // https://dev.to/pulljosh/how-to-load-html-css-and-js-code-into-an-iframe-2blc
    const url = getGeneratedPageURL({
      html: scriptableObjectData.files[1].value,
      css: scriptableObjectData.files[0].value,
      js: scriptableObjectData.files[2].value,
    });
    frameRef.current.src = url;
    // quickfix for FOUC when loading iframe (re: dark mode)
    setTimeout(() => {
      setShouldShow(true);
    },200)
  }, [scriptableObjectData]);

  return (
    <iframe
      ref={frameRef}
      style={{
        position: "absolute",
        top: "0px",
        left: "0px",
        border: `none`,
        width: `100%`,
        height: `100%`,
        overflow: "hidden",
        display: `${shouldShow ? "block" : "none"}`,
        // pointerEvents: `none`
      }}
    />
  );
};
