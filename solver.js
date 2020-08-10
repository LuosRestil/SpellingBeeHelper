const fs = require("fs");
const readline = require("readline");

async function solve(magic, letters) {
  let score = 0;
  let words = [];

  const fileStream = fs.createReadStream('./valid.txt')

  const readInterface = readline.createInterface({
    input: fileStream,
  });

  for await(const line of readInterface) {
    let valid = true;
    if (!line.includes(magic)) {
      continue
    } else {
      for (let letter of line) {
        if (!letters.includes(letter)) {
          valid = false;
          break;
        }
      }
    }
    if (valid) {
      words.push(line);
      if (letters.split('').every(letter => line.includes(letter))) {
        score += 3;
      } else {
        score += 1;
      }
    }
  }

  return {score: score, words: words};
}

module.exports = solve;