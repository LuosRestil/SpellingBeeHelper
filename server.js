require("dotenv").config();
const express = require("express");
const app = express();
const fetch = require("node-fetch");
const cheerio = require("cheerio");
const request = require("request");
// const fs = require("fs");

let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}

app.use("/public", express.static(process.cwd() + "/public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.get("/validateWebster/:word", async function(req, res) {
  console.log("webster: checking");
  let word = req.params.word;
  let valid;
  await fetch(`https://www.merriam-webster.com/dictionary/${word}`)
    .then(response => {
      if (response.status == 200) {
        return response.text();
      } else {
        valid = false;
      }
    })
    .then(text => {
      if (text) {
        const $ = cheerio.load(text);
        const hword = $("h1.hword").text();
        if (hword.match(/[A-Z\-]/)) {
          valid = false;
        } else {
          valid = true;
        }
      }
    });
  if (valid) {
    res.send({ valid: true });
  } else {
    res.send({ valid: false });
  }
});

app.get("/validateOxford/:word", function(req, res) {
  let word = req.params.word;
  request(`https://www.lexico.com/definition/${word}`, function(
    error,
    response,
    body
  ) {
    let valid;
    let header = response.socket._httpMessage._header;
    let headerArr = header.split(" ");
    let path = headerArr[1];
    if (!path.includes("&")) {
      const $ = cheerio.load(body);
      let hw = $("span.hw").text();
      if (hw.match(/[A-Z]/)) {
        valid = false;
      } else {
        valid = true;
      }
    } else {
      valid = false;
    }
    if (valid) {
      res.send({ valid: true });
    } else {
      res.send({ valid: false });
    }
  });
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
                  .definitions[0];
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

const listener = app.listen(port, function() {
  console.log("Your app is listening on port " + listener.address().port);
});
