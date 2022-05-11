import sqlite from 'sqlite';
import fs from 'fs';

async function init() {
  const db = await sqlite.open('./db.sqlite', { verbose: true });
  await db.migrate({ migrationsPath: './migrations-sqlite' });
  return db;
}

const dbConn = init();

const text = fs.readFileSync("./words.txt", "utf-8");
const words = text.split(',');

populateDb();

export async function storeGame(gameResults){
    return gameResults;
}

async function populateDb(){
    const db = await dbConn;
    let insert = 'INSERT OR IGNORE INTO Words (word_id, word) VALUES (?, ?)';
    for (let i = 0; i < words.length; i++){
        db.run(insert, [i, words[i]]);
    }
    console.log("Database prepared.");
}

export async function findWord(id){
    const db = await dbConn;
    let word = db.get('SELECT * FROM Words WHERE word_id = ?', id);
    return word;
}
