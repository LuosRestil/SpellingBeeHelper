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
  console.log(`word == ${word}`);
  let valid = false;
  await fetch(`https://www.merriam-webster.com/dictionary/${word}`)
    .then(response => {
      if (response.status == 200) {
        return response.text();
      }
    })
    .then(text => {
      if (text) {
        const $ = cheerio.load(text);
        const hword = $("h1.hword").text();
        console.log(`hword == ${hword}`);
        if (hword == word) {
          valid = true;
        } else if (word.endsWith("s") && hword == word.slice(0, -1)) {
          valid = true;
        } else if (word.endsWith("es") && hword == word.slice(0, -2)) {
          valid = true;
        } else if (word.endsWith("ies") && hword == `${word.slice(0, -3)}y`) {
          valid = true;
        } else {
          console.log("webster: hword !== word");
          if ($("span.va")) {
            console.log("webster: variations found");
            let variations = $("span.va")
              .toArray()
              .map(elem => $(elem).text());
            console.log(`variations == ${variations}`);
            for (let variation of variations) {
              if (variation == word) {
                valid = true;
              }
            }
          } else if ($("span.if")) {
            console.log("webster: forms found");
            let forms = $("span.if")
              .toArray()
              .map(elem => $(elem).text());
            for (let form of forms) {
              if (form == word) {
                valid = true;
              }
            }
          }
        }
      }
    });
  if (valid) {
    console.log("webster: valid");
    res.send({ valid: true });
  } else {
    console.log("webster: invalid");
    res.send({ valid: false });
  }
});

app.get("/validateOxford/:word", async function(req, res) {
  console.log("oxford: checking");
  let word = req.params.word;
  let valid = false;
  await fetch(`https://www.lexico.com/definition/${word}`)
    .then(response => response.text())
    .then(text => {
      if (text) {
        const $ = cheerio.load(text);
        let noExactMatches = $("div.no-exact-matches").text();
        if (!noExactMatches) {
          console.log("found a page");
          // NEXT LINE SYNTAX INTENTIONALLY INCORRECT, FIX WHEN DONE TESTING
          let hw = $("span .hw").text();
          if (hw == word) {
            valid = true;
          } else if (word.endsWith("s") && hw == word.slice(-1)) {
            valid = true;
          } else if (word.endsWith("es") && hw == word.slice(-2)) {
            valid = true;
          } else if (word.endsWith("ies") && hw == `${word.slice(-3)}y`) {
            valid = true;
          } else {
            console.log("oxford: hw !== word");
            let forms = $("span.inflection-text")
              .find("span")
              .toArray()
              .map(elem => {
                let text = $(elem).text();
                if (text.endsWith(", ")) {
                  return text.slice(0, -2);
                } else {
                  return text;
                }
              });
            if (forms.length > 0) {
              console.log("oxford: forms found");
              for (let form of forms) {
                if (form == word) {
                  valid = true;
                }
              }
            }
            let variations = $("div.variant")
              .find("strong")
              .toArray()
              .map(elem => $(elem).text());
            if (variations.length > 0) {
              console.log("oxford: variations found");
              for (let variation of variations) {
                if (variation == word) {
                  valid = true;
                }
              }
            }
          }
        } else {
          console.log("oxford: no exact matches");
          let similar = $("div.similar-results")
            .find("a")
            .attr("href");
          console.log(similar);
          // CALL GET OXFORD FUNCTION ON SIMILAR
        }
      }
    });
  if (valid) {
    console.log("oxford: valid");
    res.send({ valid: true });
  } else {
    console.log("oxford: invalid");
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
