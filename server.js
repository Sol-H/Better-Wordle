const express = require("express");
const app = express();
app.use(express.static('public'));

/*
app.get("/", (req, res) =>{
    res.sendFile('public/index.html', {root: __dirname })
    // here instead you can do res.send("text to render")
})
*/

app.listen(8080, () => {
    console.log("App listening at http://localhost:8080");
})

/*"start": "node server.js",
app.all('*', (req, res) => {
  return res.redirect('/')
})
*/