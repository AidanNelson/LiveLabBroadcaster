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
  const stageDocIndex = db.data.stages.findIndex(
    (el) => el.stageId === stageId,
  );

  const stageDoc = db.data.stages[stageDocIndex];

  // check if the user is allowed to update the document
  if (!stageDoc || !stageDoc.editors.includes(userId)) {
    return new Error("User is not authorized to update this document.");
  }

  // update the document
  db.stages[stageDocIndex] = { ...db.stages[stageDocIndex], ...update };

  // send the update to the event emitter
  stageInfoEmitter.emit("update", { stageId, update });

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

export {
  getStagesDatabase,
  getUsersDatabase,
  getSessionsDatabase,
  updateStageDoc,
  stageInfoEmitter,
  getStageInfo,
};
