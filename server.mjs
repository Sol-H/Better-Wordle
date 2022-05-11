import express from 'express'
import bodyParser from 'body-parser'
import * as db from './dbHandler.mjs'
import * as gameHandler from './gameHandler.mjs'

const app = express();
const router = express.Router();

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.listen(8080, () => {
    console.log("App listening at http://localhost:8080");
})

async function postWord(req,res){
  let word = req.body.word;
  let results = await gameHandler.checkWord(word);
  res.send(results);
}

app.post('/checkword', asyncWrap(postWord));

// async function getWord(req, res) {
//   const result = await db.findWord(req.params.id);
//   if (!result) {
//     res.status(404).send('No match for that ID.');
//     return;
//   }
//   res.json(result);
// }


// app.get('/getword/:id', asyncWrap(getWord));


// Wrap async function for express.js error handling
function asyncWrap(f){
  return (req, res, next) => {
    Promise.resolve(f(req, res, next))
    .catch((e) => next(e || new Error()));
  };
}