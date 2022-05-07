const sqlite3 = require('sqlite3').verbose()
const md5 = require('md5')
const fs = require("fs");

const DBSOURCE = "db.sqlite"

const text = fs.readFileSync("./words.txt", "utf-8");
const words = text.split(',');

let db = new sqlite3.Database(DBSOURCE, (err) => {
    if (err) {
      // Cannot open database
      console.error(err.message)
      throw err
    }else{
        console.log('Connected to the SQLite database.')
        db.run(`CREATE TABLE "Words" (
            "word_id"	INTEGER,
            "word"	TEXT NOT NULL,
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
                let insert = 'INSERT INTO Words (word_id, word) VALUES (?, ?)'
                for (let i = 0; i < words.length; i++){
                    db.run(insert, [i, words[i]])
                }
            }
        });  
    }
});

async function dailyWord(){
    let date = new Date().toISOString().split('T')[0];
    let year = date.split('-')[0]
    let month = date.split('-')[1]
    let day = date.split('-')[2]
    let dayId = year+month+day % 2309
    return db.get('SELECT * FROM Words WHERE id = ?', dayId);
}

module.exports = db
module.exports = dailyWord()