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

// this function wraps the update function, and emits an event when the database is updated
const updateStageDoc = async ({ id, update }) => {
  const { db } = await getStagesDatabase();

  // find the index of the document in the database
  const stageDocIndex = db.data.stages.findIndex((el) => el.stageId === id);

  // update the document
  db.stages[stageDocIndex] = { ...db.stages[stageDocIndex], ...update };

  // send an upate to the event emitter
  stageInfoEmitter.emit("update", { id, update });
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
};
