import sqlite from 'sqlite'
import fs from 'fs'


const DBSOURCE = "db.sqlite"

const text = fs.readFileSync("./words.txt", "utf-8");
const words = text.split(',');

const db = new sqlite3.Database(DBSOURCE, (err) => {
    if (err) {
      // Cannot open database
      console.error(err.message)
      throw err
    }else{
        console.log('Connected to the SQLite database.')
        db.run(`CREATE TABLE IF NOT EXISTS "Words" (
            "word_id"	INTEGER,
            "word"	TEXT NOT NULL,
            UNIQUE ("word"),
            PRIMARY KEY("word_id")
        );
            )`,
        (err) => {
            if (err) {
                // Table already created
                console.log("Table has already been created")
            }else{
                // Table just created, populating it with words
                console.log('Populating database, please wait.')
                let insert = 'INSERT OR IGNORE INTO Words (word_id, word) VALUES (?, ?)'
                for (let i = 0; i < words.length; i++){
                    db.run(insert, [i, words[i]])
                }
                console.log("Database populated.")
            }
        });  
    }
});

async function dailyWord(){
    let date = new Date().toISOString().split('T')[0];
    let year = date.split('-')[0];
    let month = date.split('-')[1];
    let day = date.split('-')[2];
    const dayId = (year+month+day) % 2309; // 2309 is the number of words in the words.txt file
    return findWord(dayId);
}

async function findWord(id){
    console.log(db);
let word = db.get('SELECT * FROM Words WHERE word_id = ?', id);
  return word;
}

exports.db = db
exports.dailyWord = dailyWord
exports.findWord = findWord