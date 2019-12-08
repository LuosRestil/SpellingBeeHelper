// init project
const express = require("express");
const app = express();
const fetch = require('node-fetch');

// http://expressjs.com/en/starter/static-files.html
app.use("/public", express.static(process.cwd() + "/public"));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.get("/define", (req, res) => {
  let toDefine = req.query.word.toLowerCase();
  fetch(
    `https://www.dictionaryapi.com/api/v3/references/collegiate/json/${toDefine}?key=${process.env.API_KEY}`
  )
    .then(response => response.json())
    .then(json => {
      if (json.length > 0) {
        console.log('definition found')
        let definition = json[0].shortdef[0];
        console.log(definition)
        res.json({definition: definition})
      }
      else {
        console.log('no definition found')
        res.json({definition: `No definition for "${req.query.word}" found.`})
      }
    })
    .catch(err => {
      console.log(err);
    });
});

// listen for requests :)
const listener = app.listen(process.env.PORT || 3000, function() {
  console.log("Your app is listening on port " + listener.address().port);
});
