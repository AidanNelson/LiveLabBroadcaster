import { v4 as uuidv4 } from "uuid";

import { defaultP5SketchFiles } from "./defaultP5SketchFiles";
import { initialState } from "@/components/ScriptObject/files";

export const createDefaultScriptableObject = () => {
  return {
    type: "scriptableObject",
    id: uuidv4(),
    files: initialState(),
  };
};
