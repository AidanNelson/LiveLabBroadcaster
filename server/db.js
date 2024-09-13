import { JSONFilePreset } from "lowdb/node";

let stagesDatabase = null;
const getStagesDatabase = async () => {
  if (stagesDatabase) {
    return { db: stagesDatabase };
  }
  const db = await JSONFilePreset("data/stages-db.json", { stages: [] });
  stagesDatabase = db;
  return { db };
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

export { getStagesDatabase, getUsersDatabase, getSessionsDatabase };
