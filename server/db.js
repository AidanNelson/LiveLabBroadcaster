import { JSONFilePreset } from "lowdb/node";

let usersDb = null;
async function getUsersDb() {
  if (!usersDb) {
    usersDb = await JSONFilePreset("users.json", {});
    return usersDb;
  }
}
