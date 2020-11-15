require("dotenv").config();
const express = require("express");
const app = express();
const fetch = require("node-fetch");
const bodyParser = require('body-parser');
const validate = require("./validate.js");
const solve = require("./solver.js");
const path = require("path");

let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}

app.use("/public", express.static(process.cwd() + "/public"));

app.use(bodyParser.urlencoded({extended:false})) 
app.use(bodyParser.json()) 

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.get("/validateWebster/:word", async function(req, res) {
  console.log("########################################");
  console.log("webster: checking");
  let word = req.params.word;
  let valid = await validate.validateWebster(word);
  console.log(`validateWebster == ${valid}`);
  if (valid) {
    res.send({ valid: true });
  } else {
    res.send({ valid: false });
  }
});

app.get("/validateOxford/:word", async function(req, res) {
  console.log("oxford: checking");
  let word = req.params.word;
  let valid = await validate.validateOxford(word, word, 0);
  console.log(`validateOxford == ${valid}`);
  if (valid) {
    res.send({ valid: true });
  } else {
    res.send({ valid: false });
  }
});

app.get("/define", (req, res) => {
  let toDefine = req.query.word.toLowerCase();
  fetch(
    `https://www.dictionaryapi.com/api/v3/references/collegiate/json/${toDefine}?key=${process.env.WEBSTER_KEY}`
  )
    .then(response => response.json())
    .then(json => {
      if (json.length > 0 && typeof json[0] == "object") {
        let definition = json[0].shortdef[0];
        if (definition) {
          res.json({ definition: definition });
        } else {
          let variant = json[0].cxs[0].cxl + " " + json[0].cxs[0].cxtis[0].cxt;
          res.json({ definition: variant });
        }
      } else {
        let headers = {
          app_id: process.env.OXFORD_ID,
          app_key: process.env.OXFORD_KEY
        };
        fetch(
          `https://od-api.oxforddictionaries.com/api/v2/entries/en-us/${toDefine}`,
          { method: "GET", headers: headers }
        )
          .then(response => response.json())
          .then(json => {
            if (json.error) {
              res.json({
                definition: `No definition for "${req.query.word}" found.`
              });
            } else {
              console.log(json.results[0].lexicalEntries[0].entries[0]);
              let definition;
              try {
                definition =
                  json.results[0].lexicalEntries[0].entries[0].senses[0]
                    .definitions[0];
              } catch {
                try {
                  definition =
                    json.results[0].lexicalEntries[0].entries[0].senses[0]
                      .crossReferenceMarkers[0];
                } catch {
                  res.json({
                    definition: `No definition for "${req.query.word}" found.`
                  });
                }
              }
              definition = definition[0].toUpperCase() + definition.slice(1);
              res.json({ definition: definition });
            }
          })
          .catch(err => console.log(err));
      }
    })
    .catch(err => {
      console.log(err);
    });
});

app.get('/solve', async function(req, res) {
  let data = await solve(req.query.magicLetter, req.query.letters);
  res.send(data);
})

const listener = app.listen(port, function() {
  console.log("Your app is listening on port " + listener.address().port);
});
