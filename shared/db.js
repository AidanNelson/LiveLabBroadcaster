const { MongoClient, ServerApiVersion } = require("mongodb");
const fs = require("fs");

const keyFile = fs.readFileSync("./db-key.pem");
const certFile = fs.readFileSync("./db-cert.pem");

export const mongoClient = new MongoClient(
  "mongodb+srv://virtual-venue-db.kvb2fum.mongodb.net/?authSource=%24external&authMechanism=MONGODB-X509&retryWrites=true&w=majority",
  {
    key: keyFile,
    cert: certFile,
    serverApi: ServerApiVersion.v1,
  },
);

let cachedClient = null;
let cachedDb = null;

export const getDatabase = async () => {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }
  const client = mongoClient;
  await client.connect();
  const db = mongoClient.db("virtual-venue-db");

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}
