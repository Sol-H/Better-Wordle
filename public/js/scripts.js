document.addEventListener("DOMContentLoaded",() =>{
  createTiles();
  createKeyboard();

  let guessedWords = [[]];
  let availableSpace = 1;

  let word = "heart";
  //let word = getNewWord();
  let guessedWordCount = 0;

  const keys = document.querySelectorAll('.key-row button');

  addKeyboardClicks();

// FUNCTION FOR WHEN API IS WORKING
  // function getNewWord(){
  //   fetch(
  //     'api link',
  //     {method: 'GET',
  //     OTHER STUFF, 
  //   },
  //   );
  // }

  function getTileColor(letter, index){
    const isCorrectLetter = word.includes(letter);

    //If the letter is not correct, make the tile grey
    if (!isCorrectLetter){
      return "rgb(58,58,60)";
    }

    const letterInThatPosition = word.charAt(index);
    const isCorrectPosition = letter === letterInThatPosition;

    // IF correct position the color is green
    if (isCorrectPosition){
      return "rgb(83, 141, 78)";
    }
    // Otherwise it is yellow
    return "rgb(181, 159, 59)";
  }

  function handleSubmitWord(){
    const currentWordArr = getCurrentWordArr();
    if (currentWordArr.length != 5){
      window.alert("Word must be 5 letters!");
      return;
    }
    const currentWord = currentWordArr.join('');

    //Set colours and animations for the current word
    const firstLetterId = guessedWordCount * 5 +1;
    const interval = 200;
    currentWordArr.forEach((letter, index) => {
      setTimeout(()=>{
        const tileColor = getTileColor(letter, index);

        const letterId = firstLetterId + index;
        const letterEl = document.getElementById(letterId);
        letterEl.classList.add("animate__flipInX");
        letterEl.style = `outline-color:${tileColor};background-color:${tileColor};`

      }, interval * index);
    });

    guessedWordCount += 1;

    if (currentWord === word){
      window.alert("Congratulations");
    }

    if (guessedWords.length === 6){
      window.alert(`Sorry, you have no more guesses! The word is ${word}!`);
    }

    guessedWords.push([]);
  }

  function handleDeleteLetter(){
    const currentWordArr = getCurrentWordArr();
    if(currentWordArr.length > 0){
      const removedLetter = currentWordArr.pop();
      guessedWords[guessedWords.length -1] = currentWordArr;

      const lastLetterEl = document.getElementById(String(availableSpace - 1));

      lastLetterEl.textContent = '';
      availableSpace = availableSpace -1
    }
  }

  function getCurrentWordArr() {
    const numberOfGuessedWords = guessedWords.length;
    return guessedWords[numberOfGuessedWords -1];
  }

  function updateGuessedWords(letter){
    const currentWordArr = getCurrentWordArr();
    if (currentWordArr && currentWordArr.length < 5) {
      currentWordArr.push(letter);
      const availableSpaceEl = document.getElementById(String(availableSpace));
      availableSpace += 1;
      availableSpaceEl.textContent = letter;
    }
    console.log(guessedWords);
  }

    function createTiles(){
      const board = document.querySelector('#board');
      
        for (let i=0; i < 30; i++){
          let tile = document.createElement("div");
          tile.classList.add("tile");
          tile.classList.add("animate__animated");
          tile.setAttribute("id", i+1);
          board.append(tile);
        }
      }

    function createKeyboard(){
      const keyLetters = [
        'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p',
         'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l',
        'enter','z', 'x', 'c', 'v', 'b', 'n', 'm', 'del'
      ]

      for (const key of keyLetters){
        let keyRows = document.querySelectorAll('.key-row')
        let newKey = document.createElement('button');

        newKey.setAttribute('data-key', key);
        newKey.textContent = key;

        // Top row of letters
        if(keyLetters.indexOf(key)<10){
          keyRows[0].append(newKey);
        }
        // Middle row of letters
        else if(keyLetters.indexOf(key)<19){
          keyRows[1].append(newKey);
        }
        // Bottom row of letters
        else{
          keyRows[2].append(newKey);
        }
        // Make backspace and enter larger
        if (keyLetters.indexOf(key) == 19 || keyLetters.indexOf(key) == 27){
          newKey.classList.add("larger");
        }
      }
    }

// Add event listeners to each key on the keyboard
  function addKeyboardClicks(){
    for (let key of keys){
      key.onclick = ({target}) => {
        const letter = target.getAttribute('data-key');

        if (letter === "enter"){
          handleSubmitWord();
          return;
        }

        if (letter === "del"){
          handleDeleteLetter();
          return
        }

        updateGuessedWords(letter);
      }
    }
  }
  

  })