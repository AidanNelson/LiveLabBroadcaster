import { v4 as uuidv4 } from "uuid";

import { defaultP5SketchFiles } from "./defaultP5SketchFiles";

export const createDefaultScriptableObject = () => {
  return {
    type: "scriptableObject",
    id: uuidv4(),
    files: defaultP5SketchFiles,
    active: true,
  };
};

export const createDefaultCanvasObject = () => {
  return {
    type: "canvas",
    active: true,
    images: []
  }
}