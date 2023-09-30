
const { MongoClient, ServerApiVersion } = require('mongodb');
const fs = require('fs');

const keyFile = fs.readFileSync('./X509-key-2845449389930019083.pem');
const certFile = fs.readFileSync('./X509-cert-2845449389930019083.pem');

export const mongoClient = new MongoClient('mongodb+srv://virtual-venue-db.kvb2fum.mongodb.net/?authSource=%24external&authMechanism=MONGODB-X509&retryWrites=true&w=majority', {
  key: keyFile,
  cert: certFile,
  serverApi: ServerApiVersion.v1
});