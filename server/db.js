import { JSONFilePreset } from 'lowdb/node'



let stagesDatabase = null;
const getStagesDatabase = async () => {
  if (stagesDatabase) {
    return { db: stagesDatabase };
  }
  const db = await JSONFilePreset('stages-db.json', { stages: [] })
  stagesDatabase = db;
  return { db };
}

let usersDatabase = null;
const getUsersDatabase = async () => {
  if (usersDatabase) {
    return { db: usersDatabase };
  }
  const db = await JSONFilePreset('users-db.json', { users: [] })
  usersDatabase = db;
  return { db };
}

let sessionsDatabase = null;
const getSessionsDatabase = async () => {
  if (sessionsDatabase) {
    return { db: sessionsDatabase };
  }
  const db = await JSONFilePreset('sessions-db.json', null)
  sessionsDatabase = db;
  return { db };
}


export {
  getStagesDatabase,
  getUsersDatabase,
  getSessionsDatabase,
};
