import { v4 as uuidv4 } from "uuid";

import { defaultP5SketchFiles } from "./defaultP5SketchFiles";

export const createDefaultScriptableObject = () => {
  return {
    type: "scriptableObject",
    info: { files: defaultP5SketchFiles },
    active: true,
  };
};

export const createDefaultCanvasObject = () => {
  return {
    type: "canvas",
    active: true,
    info: { images: [] },
  };
};
