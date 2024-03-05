import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";
import { getUsersDb } from "./db.js";

async function createUser({ username, password }) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, "sha512")
    .toString("hex");

  const user = {
    id: uuidv4(),
    createdAt: Date.now(),
    username,
    hash,
    salt,
  };

  console.log("adding user:", user);

  let usersDb = getUsersDb();
  usersDb.data.users.push(user);

  return user;
}

async function findUser({ username }) {
  let usersDb = getUsersDb();
  let user = usersDb.data.users.find((user) => user.username === username);
  return user ? user : null;
}

// Compare the password of an already fetched user (using `findUser`) and compare the
// password for a potential match
function validatePassword(user, inputPassword) {
  const inputHash = crypto
    .pbkdf2Sync(inputPassword, user.salt, 1000, 64, "sha512")
    .toString("hex");
  const passwordsMatch = user.hash === inputHash;
  return passwordsMatch;
}

module.exports = { findUser, createUser, validatePassword };
