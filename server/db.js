import { createRequire } from "node:module";
const require = createRequire(import.meta.url);

import { JSONFilePreset } from "lowdb/node";
const EventEmitter = require("node:events");

// create an event emitter to watch changes in the database

const stageInfoEmitter = new EventEmitter();

let stagesDatabase = null;
const getStagesDatabase = async () => {
  if (stagesDatabase) {
    return { db: stagesDatabase };
  }
  const db = await JSONFilePreset("data/stages-db.json", { stages: [] });
  stagesDatabase = db;
  return { db };
};

const getAllStagesInfo = async () => {
  // this function returns the document from the database
  const { db } = await getStagesDatabase();
  const allStageDocs = db.data.stages;
  return allStageDocs;
};


const getStageInfo = async ({ stageId }) => {
  // this function returns the document from the database
  const { db } = await getStagesDatabase();
  const stageDoc = db.data.stages.find((el) => el.id === stageId);
  return stageDoc;
};

// this function wraps the update function, and emits an event when the database is updated
const updateStageDoc = async ({ stageId, userId, update }) => {
  const { db } = await getStagesDatabase();

  // find the index of the document in the database
  const stageDocIndex = db.data.stages.findIndex((el) => el.id === stageId);

  const existingStageDoc = db.data.stages[stageDocIndex];

  // check if the user is allowed to update the document
  if (!existingStageDoc || !existingStageDoc.editors.includes(userId)) {
    return new Error("User is not authorized to update this document.");
  }

  // update the document
  db.data.stages[stageDocIndex] = { ...existingStageDoc, ...update };
  db.write();

  // send the update to the event emitter
  stageInfoEmitter.emit("update", { stageId, update });

  return null;
};

function deepMerge(target, source) {
  let result = { ...target }; // Create a shallow copy of the target

  for (let key in source) {
    if (source[key] instanceof Object && key in target) {
      // Recursively merge nested objects
      result[key] = deepMerge(target[key], source[key]);
    } else {
      // Copy the source property if it doesn't need merging
      result[key] = source[key];
    }
  }

  return result; // Return the merged result
}

// this function wraps the update function, and emits an event when the database is updated
const updateFeature = async ({ stageId, featureId, userId, update }) => {
  const { db } = await getStagesDatabase();

  // find the index of the document in the database
  const stageDocIndex = db.data.stages.findIndex((el) => el.id === stageId);

  const existingStageDoc = db.data.stages[stageDocIndex];

  // check if the user is allowed to update the document
  if (!existingStageDoc || !existingStageDoc.editors.includes(userId)) {
    return new Error("User is not authorized to update this document.");
  }

  // find the feature document in the stage document
  const featureIndex = existingStageDoc.features.findIndex(
    (x) => x.id === featureId,
  );

  const existingFeatureDoc = existingStageDoc.features[featureIndex];

  // update the document
  db.data.stages[stageDocIndex].features[featureIndex] = {
    ...existingFeatureDoc,
    ...update,
  };
  db.write();

  // send the update to the event emitter
  stageInfoEmitter.emit("update", {
    stageId,
    update: db.data.stages[stageDocIndex],
  });

  return null;
};

let usersDatabase = null;
const getUsersDatabase = async () => {
  if (usersDatabase) {
    return { db: usersDatabase };
  }
  const db = await JSONFilePreset("data/users-db.json", { users: [] });
  usersDatabase = db;
  return { db };
};

let sessionsDatabase = null;
const getSessionsDatabase = async () => {
  if (sessionsDatabase) {
    return { db: sessionsDatabase };
  }
  const db = await JSONFilePreset("data/sessions-db.json", null);
  sessionsDatabase = db;
  return { db };
};

let chatsDatabase = null;
const getChatsDatabase = async () => {
  if (chatsDatabase) {
    return { db: chatsDatabase };
  }
  const db = await JSONFilePreset("data/chats-db.json", {chats: []});
  chatsDatabase = db;
  return { db };
};

let displayNamesForChat = null;
const getDisplayNamesForChatDatabase = async () => {
  if (displayNamesForChat) {
    return { db: displayNamesForChat };
  }
  const db = await JSONFilePreset("data/displayNamesForChat-db.json", {displayNames: []});
  displayNamesForChat = db;
  return { db };
};

export {
  getStagesDatabase,
  getUsersDatabase,
  getSessionsDatabase,
  updateStageDoc,
  updateFeature,
  stageInfoEmitter,
  getStageInfo,
  getAllStagesInfo,
  getChatsDatabase,
  getDisplayNamesForChatDatabase
};
