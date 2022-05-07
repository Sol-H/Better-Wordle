const express = require("express");
const app = express();
const db = require("./dbHandler");


app.use(express.static('public'));

app.listen(8080, () => {
    console.log("App listening at http://localhost:8080");
})

async function getDailyWord(req, res) {
  const word = await db.dailyWord();
  res.json(word);
}

async function getWord(req, res) {
  console.log(req.params.id);
  const result = await db.findWord(req.params.id);
  if (!result) {
    res.status(404).send('No match for that ID.');
    return;
  }
  console.log(result);
  res.json(result);
}

app.get('/word', asyncWrap(getDailyWord));
app.get('/getWord/:id', asyncWrap(getWord));

// Wrap async function for express.js error handling
function asyncWrap(f){
  return (req, res, next) => {
    Promise.resolve(f(req, res, next))
    .catch((e) => next(e || new Error()));
  };
}