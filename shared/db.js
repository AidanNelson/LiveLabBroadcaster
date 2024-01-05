const { MongoClient, ServerApiVersion } = require("mongodb");
const fs = require("fs");

const keyFile = fs.readFileSync("./db-key.pem");
const certFile = fs.readFileSync("./db-cert.pem");

export const mongoClient = new MongoClient(
  process.env.MONGODB_URL,
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
