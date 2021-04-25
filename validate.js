const fetch = require("node-fetch");
const cheerio = require("cheerio");
const axios = require("axios");
const { response } = require("express");

async function validateWebster(word) {
  console.log(`word == ${word}`);
  try {
    return await axios.get(`https://www.merriam-webster.com/dictionary/${word}`)
    .then(response => {
      if (response.status == 200) {
        return response.data;
      } else {
        console.log(`webster: 404 not found`);
      }
    })
    .then(text => {
      if (text) {
        const $ = cheerio.load(text);
        const hword = $("h1.hword").text();
        console.log(`hword == ${hword}`);
        if (hword == word) {
          console.log("webster: hword == word");
          return true;
        } else if (word.endsWith("s") && hword == word.slice(0, -1)) {
          return true;
        } else if (word.endsWith("es") && hword == word.slice(0, -2)) {
          return true;
        } else {
          console.log("webster: hword !== word");
          let variations = $("span.va")
            .toArray()
            .map(elem => $(elem).text());
          if (variations.length > 0) {
            console.log("webster: variations found");
            for (let variation of variations) {
              if (variation == word) {
                console.log(`webster: ${word} is a variation of ${hword}`);
                return true;
              } else if (word.endsWith("s") && variation == word.slice(0, -1)) {
                console.log(
                  `webster: ${word} is a plural of a variation of ${hword}`
                );
                return true;
              } else if (
                word.endsWith("es") &&
                variation == word.slice(0, -2)
              ) {
                console.log(
                  `webster: ${word} is a plural of a variation of ${hword}`
                );
                return true;
              }
            }
          }
          let forms = $("span.if")
            .toArray()
            .map(elem => $(elem).text());
          if (forms.length > 0) {
            console.log("webster: forms found");
            for (let form of forms) {
              if (form == word) {
                console.log(`webster: ${word} is a form of ${hword}`);
                return true;
              } else if (word.endsWith("s") && form == word.slice(0, -1)) {
                console.log(
                  `webster: ${word} is a plural of a form of ${hword}`
                );
                return true;
              } else if (word.endsWith("es") && form == word.slice(0, -2)) {
                console.log(
                  `webster: ${word} is a plural of a form of ${hword}`
                );
              }
            }
          }
          let otherWordsFrom = $("span.ure")
            .toArray()
            .map(elem => $(elem).text());
          if (otherWordsFrom.length >= 1) {
            console.log("webster: otherWordsFrom found");
            for (let otherWord of otherWordsFrom) {
              if (otherWord == word) {
                console.log(`webster: ${word} is another word from ${hword}`);
                return true;
              } else if (word.endsWith("s") && otherWord == word.slice(0, -1)) {
                console.log(
                  `webster: ${word} is a plural of another word from ${hword}`
                );
                return true;
              } else if (
                word.endsWith("es") &&
                otherWord == word.slice(0, -2)
              ) {
                console.log(
                  `webster: ${word} is a plural of another word from ${hword}`
                );
              }
            }
          }
        }
      }
      return false;
    });
  } catch (err) {
    console.log(err);
  }
}

async function validateOxford(word, redirect, iteration) {
  if (iteration < 2) {
    let nextIteration = iteration + 1;
    let text;
    try {
      text = await axios.get(`https://www.lexico.com/definition/${redirect}`).then(response => response.data);
    } catch (err) {
      text = err.response.data;
    }
    if (text) {
      const $ = cheerio.load(text);
      let noExactMatches = $("div.no-exact-matches").text();
      if (!noExactMatches) {
        let hw = $("span.hw").text();
        // THERE CAN BE MULTIPLE HWORDS, ENDING IN NUMBERS
        let hws = hw.split(/[0-9]/);
        let hwEqualToWord = false;
        for (let item of hws) {
          if (item === word) {
            hwEqualToWord = true;
          }
        }
        if (hwEqualToWord) {
          console.log("oxford: hw == word");
          return true;
        } else if (word.endsWith("s") && hw == word.slice(0, -1)) {
          return true;
        } else if (word.endsWith("es") && hw == word.slice(0, -2)) {
          return true;
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
                console.log(`oxford: ${word} is a form of ${redirect}`);
                return true;
              } else if (word.endsWith("s") && form == word.slice(0, -1)) {
                console.log(
                  `oxford: ${word} is a plural of a form of ${redirect}`
                );
                return true;
              } else if (word.endsWith("es") && form == word.slice(0, -2)) {
                console.log(
                  `oxford: ${word} is a plural of a form of ${redirect}`
                );
                return true;
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
                console.log(`oxford: ${word} is a variant of ${redirect}`);
                return true;
              } else if (
                word.endsWith("s") &&
                variation == word.slice(0, -1)
              ) {
                console.log(
                  `oxford: ${word} is a plural of a variant of ${redirect}`
                );
                return true;
              } else if (
                word.endsWith("s") &&
                variation == word.slice(0, -2)
              ) {
                console.log(
                  `oxford: ${word} is a plural of a variant of ${redirect}`
                );
                return true;
              }
            }
          }
        }
      } else {
        let similar = $("div.similar-results")
          .find("a")
          .attr("href");
        if (similar && !similar.includes("?")) {
          similar = similar.slice(12);
          console.log(
            `oxford: no exact matches, redirecting to "${similar}"`
          );
          return validateOxford(word, similar, nextIteration);
        } else {
          console.log("oxford: no matches or redirects");
          return false;
        }
      }
      return false;
    }

    
  } else {
    return false;
  }
}

exports.validateOxford = validateOxford;
exports.validateWebster = validateWebster;
