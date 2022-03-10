const express = require("express");
const app = express();
const port = 8080;
app.use(express.static('public'));

/*
app.get("/", (req, res) =>{
    res.sendFile('public/index.html', {root: __dirname })
    // here instead you can do res.send("text to render")
})
*/

app.listen(port, () => {
    console.log("App listening at http://localhost:${port}");
})

/*
app.all('*', (req, res) => {
  return res.redirect('/')
})
*/