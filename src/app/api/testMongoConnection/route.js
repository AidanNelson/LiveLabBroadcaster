
const { MongoClient, ServerApiVersion } = require('mongodb');
const fs = require('fs');

const keyFile = fs.readFileSync('./X509-key-2845449389930019083.pem');
const certFile = fs.readFileSync('./X509-cert-2845449389930019083.pem');


const client = new MongoClient('mongodb+srv://virtual-venue-db.kvb2fum.mongodb.net/?authSource=%24external&authMechanism=MONGODB-X509&retryWrites=true&w=majority', {
  key: keyFile,
  cert: certFile,
  serverApi: ServerApiVersion.v1
});


export async function GET() {
  try {

    
    await client.connect();
    const database = client.db("virtual-venue-db");
    const collection = database.collection("venues");
    const docCount = await collection.countDocuments({});
    console.log(docCount);
    return Response.json(docCount);
    // perform actions using client
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}

// run().catch(console.dir);

