const express = require("express");
const app = express();
const port = 3000;

app.get("/", (req, res) =>{
    res.send("Hello world")
    // here instead you can do res.sendFile(put html file inside here to render)
})

app.listen(port, () => {
    console.log("App listening at http://localhost:${port}");
})

app.all('*', (req, res) => {
  return res.redirect('/')
})