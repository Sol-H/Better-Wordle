document.addEventListener("DOMContentLoaded",() =>{
  createTiles();
  createKeyboard();

  let guessedWords = [[]];
  let availableSpace = 1;

  let word = "penis";
  //let word = getNewWord();
  let guessedWordCount = 0;

  const keys = document.querySelectorAll('.key-row button');

  addKeyboardClicks();
  window.addEventListener("keydown", typingHandler);

// FUNCTION FOR WHEN API IS WORKING
  // function getNewWord(){
  //   fetch(
  //     'api link',
  //     {method: 'GET',
  //     OTHER STUFF, 
  //   },
  //   );
  // }

  // Add functionality for typing on physical keyboard
  function typingHandler(event){
    let letter = event.key;

    if (letter === "Enter"){
      submitWord();
      return;
    }

    if (letter === "Backspace"){
      deleteLetter();
      return
    }

    //Make sure only letters are allowed
    if (letter.match(/^[a-z]$/)){
      updateGuessedWords(letter);
    }
    
  }


  // Add event listeners to each key on the on screen keyboard
  function addKeyboardClicks(){
    for (let key of keys){
      key.onclick = ({target}) => {
        const letter = target.getAttribute('data-key');

        if (letter === "enter"){
          submitWord();
          return;
        }

        if (letter === "del"){
          deleteLetter();
          return;
        }

        updateGuessedWords(letter);
      }
    }
  }

  async function submitWord(){
    const currentWordArr = getCurrentWordArr();

    //Make sure the word is 5 letters long
    if (currentWordArr.length != 5){
      return;
    }

    const currentWord = currentWordArr.join('');

    let isRealWord = await checkRealWord(currentWord);

    //Make sure the word is in the dictionary
    if (!isRealWord){
      alert("Not a real word!")
      return;
    }

    const firstLetterId = guessedWordCount * 5 +1;
    const interval = 200;

    //Set colours and animations for the current word
    currentWordArr.forEach((letter, index) => {
      setTimeout(()=>{
      
        //Change the colors of tiles based on guess
        const letterId = firstLetterId + index;
        const letterEl = document.getElementById(letterId);
        
        const tileColor = getTileColor(letter, index, currentWordArr);
        
        letterEl.classList.add("animate__flipInX");
        letterEl.style = `outline-color:${tileColor};background-color:${tileColor};`

        //Change the colors of keyboard buttons based on guess
        const letterKeyEl = document.querySelector(`[data-key="${letter}"]`);
        letterKeyEl.style = `background-color:${tileColor};`

      }, interval * index);
    });

    guessedWordCount += 1;

    // WInning guess
    if (currentWord === word){
      window.alert("You win!!!");
      return;
    }

    if (guessedWords.length === 6){
      window.alert(`Sorry, you have no more guesses! The word is ${word}!`);
    }  

    guessedWords.push([]);
  }

  async function checkRealWord(word_){
    const code = await fetch("https://dictionary-dot-sse-2020.nw.r.appspot.com/" + word_).then(function(response){
      return response.status
  })
    console.log(code);
    return code === 200;
}

  function getTileColor(letter, index, currentWordArr){

    const letterInThatPosition = word.charAt(index);
    const isCorrectPosition = letter === letterInThatPosition;
    const isCorrectLetter = word.includes(letter);

    // IF correct position, return green
    if (isCorrectPosition){
      return "rgb(83, 141, 78)";
    }

    // Make sure only one square is yellow for the same letters
    let letterCount = 0;
    let firstLetter = true;
    currentWordArr.forEach((countedLetter, i) => {
      console.log(countedLetter + letter);
      if (countedLetter == letter){
        letterCount += 1;
        if (i < index){
          firstLetter = false;
        }
      }

    });

     // If the letter is in the word, return yellow
     if (isCorrectLetter && firstLetter){
      return "rgb(181, 159, 59)";
    }

    // Otherwise, return grey
    return "rgb(58,58,60)";

  }

  function deleteLetter(){
    const currentWordArr = getCurrentWordArr();
    if(currentWordArr.length > 0){
      currentWordArr.pop();
      guessedWords[guessedWords.length -1] = currentWordArr;

      const lastLetterEl = document.getElementById(String(availableSpace - 1));

      lastLetterEl.textContent = '';
      lastLetterEl.style = 'outline-color:#272729';
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
      availableSpaceEl.style = 'outline-color:rgb(58,58,60)';
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

})