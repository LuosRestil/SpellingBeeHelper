// *** VARIABLES ***

let magicLetter = "";
let letters = "";
let lettersList = [];
let wordList = [];
let score = 0;
let wordNumber = 0;

// *** FUNCTIONS ***
// Checks that all letters of a word are in the letters list and the word is in a dictionary

// Shuffles letters list
function shuffle(array) {
  var currentIndex = array.length,
    temporaryValue,
    randomIndex;
  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
}

// Display words alphabetically
function generateWordDisplay() {
  let sortedWords = wordList.slice().sort();
  document.getElementById("word-list").innerHTML = "";
  for (let word of sortedWords) {
    document
      .getElementById("word-list")
      .insertAdjacentHTML(
        "beforeend",
        `<li class='listItem'><span class='listItemText'>${word}</span><i class="fas fa-times-circle"></i></li>`
      );
  }
}

function saveLocalStorage() {
  let data = {
    magicLetter: magicLetter,
    letters: letters,
    lettersList: lettersList,
    wordList: wordList,
    score: score
  };
  window.localStorage.setItem("saveData", JSON.stringify(data));
}

function deleteWord(element) {
  let targetText = element.parentNode.childNodes[0].textContent;
  if (lettersList.every(letter => targetText.includes(letter))) {
    score -= 3;
  } else {
    score -= 1;
  }
  document.getElementById("score").innerHTML = `Score: ${score}`;

  for (let word of wordList) {
    if (word == targetText) {
      let index = wordList.indexOf(word);
      wordList.splice(index, 1);
      saveLocalStorage();
    }
  }
  element.parentNode.parentNode.removeChild(element.parentNode);
}

async function checkDictionaries(word) {
  console.log("starting checkDictionaries function");
  let valid;
  let dictionary;
  await fetch(`../validate/${word}`)
    .then(response => response.json())
    .then(json => {
      valid = json.valid;
      dictionary = json.dictionary;
    });
  console.log(`valid == ${valid}`);
  console.log(`dictionary == ${dictionary}`);
  return valid;
}

async function isValid(word) {
  console.log("starting isValid function");
  for (let letter of word) {
    if (!lettersList.includes(letter)) {
      return false;
    }
  }
  let dictValid = await checkDictionaries(word);
  console.log(`dictValid == ${dictValid}`);
  if (dictValid) {
    return true;
  } else {
    return false;
  }
}

async function submitWord() {
  console.log("starting submit function");
  let word = document.getElementById("word-input").value.toLowerCase();
  let valid = await isValid(word);
  console.log(`valid == ${valid}`);
  if (
    wordList.includes(word) ||
    !word.includes(magicLetter) ||
    !(word.length >= 5) ||
    !valid
  ) {
    console.log("word not valid");
    alert("Invalid word.");
    document.getElementById("word-input").value = "";
  } else {
    wordList.push(word);
    if (lettersList.every(letter => word.includes(letter))) {
      score += 3;
    } else {
      score += 1;
    }
    document.getElementById("score").innerHTML = `Score: ${score}`;
    document.getElementById("word-input").value = "";
    saveLocalStorage();
    generateWordDisplay();
  }
}

// *************************************************************************

window.addEventListener("DOMContentLoaded", event => {
  // Define/delete event listener
  let listDisplay = document.getElementById("word-list");
  listDisplay.addEventListener("click", function(e) {
    const element = e.target;
    if (element.classList.contains("fa-times-circle")) {
      deleteWord(element);
    }
    let toMatch = element.innerHTML;
    let match = toMatch.match(/^[A-Za-z][A-Za-z]+/g);
    if (match) {
      let toDefine = match[0];
      fetch(`../define?word=${toDefine}`)
        .then(response => {
          return response.json();
        })
        .then(data => {
          let definition =
            data.definition[0].toUpperCase() + data.definition.slice(1);
          alert(definition);
        })
        .catch(err => {
          console.log(err);
        });
    }
  });

  // New Game button logic
  document.getElementById("newGame").addEventListener("click", e => {
    window.localStorage.clear();
    location.reload();
  });

  // Shuffle button logic
  document
    .getElementById("shuffleButton")
    .addEventListener("click", function(event) {
      document.getElementById("letters").innerHTML = `Letters: ${shuffle(
        lettersList
      )
        .join("")
        .toUpperCase()} `;
    });

  // Submit button logic on click
  document.getElementById("submit-word").addEventListener("click", function(e) {
    submitWord();
  });

  // Check local storage for save data
  const storage = window.localStorage.getItem("saveData");

  // If we find save data...
  if (storage) {
    // Hide loading screen
    document.getElementById("loading-screen").style.display = "none";
    // Parse storage data
    let saveData = JSON.parse(storage);
    // Populate variables with data
    magicLetter = saveData.magicLetter;
    letters = saveData.letters;
    lettersList = saveData.lettersList;
    wordList = saveData.wordList;
    score = saveData.score;

    // Display magic letter, letters, score, and word list
    document.getElementById(
      "magic-letter"
    ).innerHTML = `Magic Letter: ${magicLetter.toUpperCase()}`;
    document.getElementById(
      "letters"
    ).innerHTML = `Letters: ${letters.toUpperCase()}`;
    document.getElementById("score").innerHTML = `Score: ${score}`;
    generateWordDisplay();

    // Display game
    document.getElementById("game").setAttribute("style", "display:block");

    // Submit button logic on Enter
    document.addEventListener("keyup", function(event) {
      if (event.keyCode == 13) {
        submitWord();
      }
    });
  }

  // ************************************************************************
  else {
    // Hide loading screen
    document.getElementById("loading-screen").style.display = "none";

    // Show form
    document.getElementById("starter-form").style.display = "block";

    // Submit letters and make sure all valid
    document
      .getElementById("submit-button")
      .addEventListener("click", function(e) {
        e.preventDefault();
        letters = document.getElementById("allLetters").value.toLowerCase();
        lettersList = letters.split("");

        if (letters.length != 7) {
          alert(
            "Your letters list must contain exactly 7 letters, and no spaces. Please try again. "
          );
          return;
        }
        let uniqueLetters = [];
        for (let letter of letters) {
          if (uniqueLetters.includes(letter)) {
            alert(`Oops! You repeated a letter. Please try again.`);
            return;
          } else {
            uniqueLetters.push(letter);
          }
        }
        magicLetter = document
          .getElementById("magicLetter")
          .value.toLowerCase();
        if (!letters.includes(magicLetter)) {
          alert(
            `Your center letter is not in your letters list. Please try again.`
          );
          return;
        }

        // Hide initial input form
        document.getElementById("starter-form").style.display = "none";

        // Display magic letter, letters, and score
        document.getElementById(
          "magic-letter"
        ).innerHTML = `Magic Letter: ${magicLetter.toUpperCase()}`;
        document.getElementById(
          "letters"
        ).innerHTML = `Letters: ${letters.toUpperCase()}`;
        document.getElementById("score").innerHTML = `Score: ${score}`;

        // Display game
        document.getElementById("game").setAttribute("style", "display:block");

        // Submit button logic on Enter
        document.addEventListener("keyup", function(event) {
          if (event.keyCode == 13) {
            submitWord();
          }
        });
      });
  }
});
