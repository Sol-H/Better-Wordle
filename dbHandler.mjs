import { MongoClient } from 'mongodb';
import fs from 'fs';

const url = process.env.MONGO; // MongoDB connection string
console.log(url);
const dbName = 'Soldle'; // Specify your database name
const client = new MongoClient(url);

async function init() {
  await client.connect();
  console.log('Connected successfully to MongoDB server');
  const db = client.db(dbName);
  // Ensure the Words collection exists and has an index on word_id
  await db.collection('Words').createIndex({ word_id: 1 }, { unique: true });
  return db;
}

const dbConn = init();

const text = fs.readFileSync('./words.txt', 'utf-8');
const words = text.split(',');

populateDb();

export function storeGame(gameResults) {
  // Implement storing game results in MongoDB
  return gameResults;
}

async function populateDb() {
  const db = await dbConn;
  const collection = db.collection('Words');
  const bulkOps = words.map((word, i) => ({
    updateOne: {
      filter: { word_id: i },
      update: { $set: { word_id: i, word: word } },
      upsert: true,
    },
  }));
  await collection.bulkWrite(bulkOps);
  console.log('Database prepared.');
}

export async function findWord(id) {
  const db = await dbConn;
  const collection = db.collection('Words');
  const word = await collection.findOne({ word_id: id });
  return word;
}
