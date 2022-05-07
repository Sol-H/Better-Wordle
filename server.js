const express = require("express");
const app = express();
app.use(express.static('public'));


app.listen(8080, () => {
    console.log("App listening at http://localhost:8080");
})

// Wrap async function for express.js error handling
function asyncWrap(f){
  return (req, res, next) => {
    Promise.resolve(f(req, res, next))
    .catch((e) => next(e || new Error()));
  };
}