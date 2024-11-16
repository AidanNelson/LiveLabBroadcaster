import { JSONFilePreset } from "lowdb/node";

let chatsDatabase = null;
const getChatsDatabase = async () => {
  if (chatsDatabase) {
    return { db: chatsDatabase };
  }
  const db = await JSONFilePreset("data/chats-db.json", { chats: [] });
  chatsDatabase = db;
  return { db };
};

let displayNamesDatabase = null;
const getDisplayNamesDatabase = async () => {
  if (displayNamesDatabase) {
    return { db: displayNamesDatabase };
  }
  const db = await JSONFilePreset("data/displayNames-db.json", {
    displayNames: [],
  });
  displayNamesDatabase = db;
  return { db };
};

export {
  getChatsDatabase,
  getDisplayNamesDatabase,
};
