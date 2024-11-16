import {
    getChatsDatabase,
    getDisplayNamesForChatDatabase,
  } from "./db.js";
  

async function clearChatsForStage({ stageId }) {
  if (!stageId) return;

  const { db: chatsDb } = await getChatsDatabase();

  console.log("Clearing chat for stage", stageId);
  chatsDb.data.chats = chatsDb.data.chats.filter(
    (msg) => msg.stageId !== stageId,
  );

  chatsDb.write();
}

async function getChatsAndDisplayNames({ stageId }) {
  const { db: chatsDb } = await getChatsDatabase();
  const { db: displayNamesForChatDb } = await getDisplayNamesForChatDatabase();

  const displayNamesForChat = displayNamesForChatDb.data.displayNames;
  const chats = chatsDb.data.chats.filter(
    (chatMessage) => chatMessage.stageId === stageId,
  );
  return { chats, displayNamesForChat };
}

async function updateDisplayNameForSocket({ socketId, displayName }) {
  const { db: displayNamesForChatDb } = await getDisplayNamesForChatDatabase();
  const existingDisplayNameIndex =
    displayNamesForChatDb.data.displayNames.findIndex(
      (displayName) => displayName.socketId === socketId,
    );
  if (existingDisplayNameIndex !== -1) {
    // update
    console.log("Updating display name:", {
      socketId: socketId,
      displayName,
    });
    displayNamesForChatDb.data.displayNames[existingDisplayNameIndex] = {
      socketId,
      displayName,
    };
  } else {
    console.log("Setting display name:", {
      socketId: socketId,
      displayName,
    });
    displayNamesForChatDb.data.displayNames.push({
      socketId: socketId,
      displayName,
    });
  }

  displayNamesForChatDb.write();
}

async function addChatMessage({ message, stageId, senderId }) {
  const { db: chatsDb } = await getChatsDatabase();

  const chatMessage = {
    message,
    senderId,
    stageId,
    timestamp: Date.now(),
  };
  chatsDb.data.chats.push(chatMessage);

  chatsDb.write();
}


export {
    clearChatsForStage,
    getChatsAndDisplayNames,
    updateDisplayNameForSocket,
    addChatMessage
}