import Editor from "@monaco-editor/react";
import { useCallback, useEffect, useRef, useState } from "react";

import { myFiles } from "../../shared/defaultP5SketchFiles";

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

  useEffect(() => {
    // https://dev.to/pulljosh/how-to-load-html-css-and-js-code-into-an-iframe-2blc
    const url = getGeneratedPageURL({
      html: scriptableObjectData.data["html"].value,
      css: scriptableObjectData.data["css"].value,
      js: scriptableObjectData.data["js"].value,
    });
    frameRef.current.src = url;
  }, [scriptableObjectData]);

  return (
    <iframe
      ref={frameRef}
      style={{ border: `none`, width: `100%`, height: `100%` }}
    />
  );
};
