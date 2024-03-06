import { JSONFilePreset } from "lowdb/node";

let usersDb = null;
export async function getUsersDb() {
  if (!usersDb) {
    usersDb = await JSONFilePreset("users.json", {});
  }
  return usersDb;
}