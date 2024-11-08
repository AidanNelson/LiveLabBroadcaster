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

let displayNamesForChat = null;
const getDisplayNamesForChatDatabase = async () => {
  if (displayNamesForChat) {
    return { db: displayNamesForChat };
  }
  const db = await JSONFilePreset("data/displayNamesForChat-db.json", {
    displayNames: [],
  });
  displayNamesForChat = db;
  return { db };
};

export {
  getChatsDatabase,
  getDisplayNamesForChatDatabase,
};
