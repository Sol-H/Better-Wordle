import express from 'express'
const app = express();
import * as db from './dbHandler.mjs'


app.use(express.static('public'));

app.listen(8080, () => {
    console.log("App listening at http://localhost:8080");
})

// async function getDailyWord(req, res) {
//   const word = await db.dailyWord();
//   const encryptedWord = Buffer.from(word.word).toString('base64'); // encrypts daily word using base64 so user cannot see
//   res.json(encryptedWord); 
//    // decrypts daily word using base64 so user cannot see
// }

async function getWord(req, res) {
  const result = await db.findWord(req.params.id);
  if (!result) {
    res.status(404).send('No match for that ID.');
    return;
  }
  res.json(result);
}

// app.get('/dailyword', asyncWrap(getDailyWord));
app.get('/getword/:id', asyncWrap(getWord));


// Wrap async function for express.js error handling
function asyncWrap(f){
  return (req, res, next) => {
    Promise.resolve(f(req, res, next))
    .catch((e) => next(e || new Error()));
  };
}