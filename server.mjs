import express from 'express';
import bodyParser from 'body-parser';
import * as gameHandler from './gameHandler.mjs';

const app = express();

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.listen(8080, () => {
  console.log('App listening at http://localhost:8080');
});

async function postWord(req, res) {
  const word = req.body.word;
  const results = await gameHandler.checkWord(word);
  res.send(results);
}

app.post('/checkword', asyncWrap(postWord));


// Wrap async function for express.js error handling
function asyncWrap(f) {
  return (req, res, next) => {
    Promise.resolve(f(req, res, next))
      .catch((e) => next(e || new Error()));
  };
}
