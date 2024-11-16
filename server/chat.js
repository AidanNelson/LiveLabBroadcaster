import {
    getChatsDatabase,
    getDisplayNamesDatabase,
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
  const { db: displayNamesDb } = await getDisplayNamesDatabase();

  const displayNames = displayNamesDb.data.displayNames;
  const chats = chatsDb.data.chats.filter(
    (chatMessage) => chatMessage.stageId === stageId,
  );
  return { chats, displayNames };
}

async function updateDisplayName({ senderId, displayName }) {
  const { db: displayNamesDb } = await getDisplayNamesDatabase();
  const existingDisplayNameIndex =
    displayNamesDb.data.displayNames.findIndex(
      (displayName) => displayName.senderId === senderId,
    );
  if (existingDisplayNameIndex !== -1) {
    // update
    console.log("Updating display name:", {
      senderId,
      displayName,
    });
    displayNamesDb.data.displayNames[existingDisplayNameIndex] = {
      senderId,
      displayName,
    };
  } else {
    console.log("Setting display name:", {
      senderId: senderId,
      displayName,
    });
    displayNamesDb.data.displayNames.push({
      senderId: senderId,
      displayName,
    });
  }

  displayNamesDb.write();
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
    updateDisplayName,
    addChatMessage
}