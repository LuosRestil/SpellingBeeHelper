// init project
require("dotenv").config();
const express = require("express");
const app = express();
const fetch = require("node-fetch");
const http = require("https");

let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}

app.use("/public", express.static(process.cwd() + "/public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
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
        console.log(definition);
        res.json({ definition: definition });
      } else {
        // MAY NEED TO ADD LEMMAS ENDPOINT BEFORE ENTRIES
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
              let definition =
                json.results[0].lexicalEntries[0].entries[0].senses[0]
                  .shortDefinitions[0];
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

// listen for requests :)
const listener = app.listen(port, function() {
  console.log("Your app is listening on port " + listener.address().port);
});
