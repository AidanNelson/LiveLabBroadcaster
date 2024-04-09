const { MongoClient, ServerApiVersion } = require("mongodb");
const fs = require("fs");

const keyFile = fs.readFileSync("./db-key.pem");
const certFile = fs.readFileSync("./db-cert.pem");

async function watchStageChanges(callback) {
  try {
    const mongoClient = new MongoClient(process.env.MONGODB_URL, {
      key: keyFile,
      cert: certFile,
      serverApi: ServerApiVersion.v1,
    });

    await mongoClient.connect();
    console.log("MongoDB driver connected.");
    const database = mongoClient.db("virtual-venue-db");
    const stagesCollection = database.collection("stages");
    const stagesChangeStream = stagesCollection.watch("/");

    stagesChangeStream.on("change", (change) => {
      callback(change);
    });

    stagesChangeStream.on("error", (err) => {
      console.log("ChangeStream ERROR:", err);

      stagesChangeStream.close();
      mongoClient.close();

      setTimeout(() => watchStageChanges(callback), 5000);
    });
  } catch (err) {
    console.log("watchStageChanges ERROR:",err);
    setTimeout(() => watchStageChanges(callback), 5000);
  }
}

async function getStageInfo({ stageId }) {
  try {
    const mongoClient = new MongoClient(process.env.MONGODB_URL, {
      key: keyFile,
      cert: certFile,
      serverApi: ServerApiVersion.v1,
    });
    await mongoClient.connect();
    const database = mongoClient.db("virtual-venue-db");
    const collection = database.collection("stages");
    const stageInfo = await collection.findOne({ stageId });
    mongoClient.close();
    return stageInfo;
  } catch (err) {
    console.log("Mongo error..");
    console.log(err);
    return {};
  }
}

module.exports = {
  getStageInfo,
  watchStageChanges,
};
