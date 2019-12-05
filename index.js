// *** VARIABLES ***

let magicLetter = "";
let letters = "";
let lettersList = [];
let wordList = [];
let score = 0;
let wordNumber = 0;

// *** FUNCTIONS ***
// Checks that a letter is in a word
function isInWord(currentValue) {
  return word.includes(currentValue);
}

// Checks that all letters of a word are in the letters list
function isValid(word) {
  for (let letter of word) {
    if (!lettersList.includes(letter)) {
      return false;
    }
  }
  return true;
}

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

function generateWordDisplay() {
  // Display words alphabetically
  let sortedWords = wordList.slice().sort();
  document.getElementById("word-list").innerHTML = "";
  for (let word of sortedWords) {
    document
      .getElementById("word-list")
      .insertAdjacentHTML(
        "beforeend",
        `<li class='listItem'><span class='listItemText'>${word}</span><i class="far fa-trash-alt"></i></li>`
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

// *************************************************************************

window.addEventListener("DOMContentLoaded", event => {
  // Delete button event listener
  let listDisplay = document.getElementById("word-list");
  listDisplay.addEventListener("click", function(e) {
    const element = e.target;
    if (element.classList.contains("fa-trash-alt")) {
      deleteWord(element);
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
    let word = document.getElementById("word-input").value;

    if (
      wordList.includes(word) ||
      !word.includes(magicLetter) ||
      !(word.length >= 5) ||
      !isValid(word)
    ) {
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
  });

  // Check local storage for save data
  const storage = window.localStorage.getItem("saveData");

  // If we find save data...
  if (storage) {
    // Hide loading screen
    document.getElementById("loading-screen").style.display = "none";
    // Parse storage data
    saveData = JSON.parse(storage);
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
    document
      .getElementById("game")
      .setAttribute(
        "style",
        "display:grid; grid-template-columns: 1fr 1fr 1fr"
      );

    // Submit button logic on Enter
    document.addEventListener("keyup", function(event) {
      if (event.keyCode == 13) {
        let word = document.getElementById("word-input").value;
        if (
          wordList.includes(word) ||
          !word.includes(magicLetter) ||
          !(word.length >= 5) ||
          !isValid(word)
        ) {
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
        document
          .getElementById("game")
          .setAttribute(
            "style",
            "display:grid; grid-template-columns: 1fr 1fr 1fr"
          );

        // Submit button logic on Enter
        document.addEventListener("keyup", function(event) {
          if (event.keyCode == 13) {
            let word = document.getElementById("word-input").value;
            if (
              wordList.includes(word) ||
              !word.includes(magicLetter) ||
              !(word.length >= 5) ||
              !isValid(word)
            ) {
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
        });
      });
  }
});
