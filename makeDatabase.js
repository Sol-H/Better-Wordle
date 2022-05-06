const sqlite3 = require('sqlite3')

let db;
new sqlite3.Database('./better-wordle.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err && err.code == "SQLITE_CANTOPEN") {
        db = createDatabase();
        return;
        } else if (err) {
            console.log("Getting error " + err);
            exit(1);
    }
    runQueries(db);
});

function createDatabase() {
  var newdb = new sqlite3.Database('better-wordle.db', (err) => {
      if (err) {
          console.log("Getting error " + err);
          exit(1);
      }
      createTables(newdb);
      return newdb;
  });
}

function createTables(newdb){
    newdb.exec(`
    create table WinnableWords (
        word_id int primary key not null,
        word text not null,
    );
    insert into hero (word_id, word)
        values (1, 'hello'),
               (2, 'words'),
               (3, 'world'));
        `, ()  => {
            runQueries(newdb);
    });
}

function runQueries(db) {
    db.all(`
    select * from WinnableWords;',)
    where word = ?`, "No word", (err, rows) => {
        rows.forEach(row => {
            console.log(row.word_id + "\t" +row.word);
        });
    });
}