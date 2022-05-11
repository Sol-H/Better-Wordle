document.addEventListener("DOMContentLoaded",async () =>{

  createTiles();
  createKeyboard();

  let score = "";
  let guessedWords = [[]]; // Stores the users guessed words
  let availableSpace = 1; // Used to determine where the most recent letter was typed

  let guessedWordCount = 0;

  // Creates a string for midnight the day after the current date, used for cookies
  let date = new Date();
  let tomorrow = new Date(date);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setTime(tomorrow.getTime() - 3600000); // take away an hour because we are in BST
  console.log(tomorrow);
  let tomorrowstr = tomorrow.toUTCString().split(' ');
  tomorrowstr[4] = '00:00:00';
  tomorrowstr[5] = "";
  tomorrowstr = tomorrowstr.join(' ');

  console.log(tomorrowstr);

  //document.cookie = `info=;expires=${tomorrowstr}; path=/;`

  // document.cookie = `word1=; expires=${tomorrowstr}; path=/;`;
  // document.cookie = `word2=; expires=${tomorrowstr}; path=/;`;
  // document.cookie = `word3=; expires=${tomorrowstr}; path=/;`;
  // document.cookie = `word4=; expires=${tomorrowstr}; path=/;`;
  // document.cookie = `word5=; expires=${tomorrowstr}; path=/;`;
  // document.cookie = `word6=; expires=${tomorrowstr}; path=/;`;


  // Stats Modal stuff
  const statsModal = document.querySelector("#statsModal");
  const statsClose = document.querySelector("#statsClose");
  const statsBtn = document.querySelector("#stats");
  const statsContent = document.querySelector("#statsContent");

  

  statsBtn.onclick = function() {
    statsModal.style.display = "block";
  }

  statsClose.onclick = function() {
    statsModal.style.display = "none";
  }
  
  window.onclick = function(event) {
    if (event.target == statsModal) {
      statsModal.style.display = "none";
    }
  } 

  // INfo Modal stuff
  const infoModal = document.querySelector("#infoModal");
  const infoClose = document.querySelector("#infoClose");
  const infoBtn = document.querySelector("#info");


  infoBtn.onclick = function() {
    infoModal.style.display = "block";
  }

  infoClose.onclick = function() {
    infoModal.style.display = "none";
  }
  
  window.onclick = function(event) {
    if (event.target == infoModal) {
      infoModal.style.display = "none";
    }
  } 

  // Toast stuff
  
  const toast = document.querySelector(".toast") ;
  const toastContent = document.querySelector(".toast-content");


  loadFromCookies();

  const keys = document.querySelectorAll('.key-row button');

  addKeyboardClicks();
  window.addEventListener("keydown", typingHandler);

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
      toast.style.display = "block"; // Show toast
      setTimeout(() =>{
        toastContent.classList.add("animate__fadeOutUp"); // Adds animation to show toast fading away
      }, 1000);
      setTimeout(() =>{
        toast.style.display = "none";
        toastContent.classList.remove("animate__fadeOutUp");
      }, 1200);
      return;
    }

    const firstLetterId = guessedWordCount * 5 +1;
    const interval = 200;

    // Get status of the guess from the server
    let results = await postData('/checkword', { word: currentWord })
      .then(data => {
    return data; // JSON data parsed by `data.json()` call
    });

    score += results.toString() + '\n';

    //Set colours and animations for the current word
    currentWordArr.forEach((letter, index) => {
      setTimeout(()=>{
      
        //Change the colors of tiles based on guess
        const letterId = firstLetterId + index;
        const letterEl = document.getElementById(letterId);
        
        let result = results[index]; // Set the correct color for the tile

        // 
        switch (result) {
          case "correct": tileColor = "rgb(83, 141, 78)"; break; // If correct make tile green
          case "present": tileColor = "rgb(181, 159, 59)"; break; // If present make tile yellow
          case "absent": tileColor = "rgb(58,58,60)"; break; // If absent make tile grey
        }
        
        letterEl.classList.add("animate__flipInX");
        letterEl.style = `outline-color:${tileColor};background-color:${tileColor};`

        //Change the colors of keyboard buttons based on guess
        const letterKeyEl = document.querySelector(`[data-key="${letter}"]`);
        letterKeyEl.style = `background-color:${tileColor};`

      }, interval * index);
    });

    guessedWordCount += 1;

    // Check if the word is a winner by checking status of all the letters in the guess
    if (String(results) == "correct,correct,correct,correct,correct"){
      document.cookie = `word${guessedWords.length}=${currentWord}; expires=${tomorrowstr}; path=/;`;
      // Makes stats modal visible
      statsModal.style.display = "block";
      makeScore();
      statsContent.textContent = `Soldle Score: ${guessedWordCount}/6`;
      return;
    }    

    if (guessedWords.length === 6){
      window.alert(`Sorry, you have no more guesses`);
    }  

    let guessedLen = guessedWords.push([]);

    // Creates cookie so that data is saved until the next day
    document.cookie = `word${guessedLen - 1}=${currentWord}; expires=${tomorrowstr}; path=/;`;
  }

  async function checkRealWord(word_){
    const code = await fetch("https://dictionary-dot-sse-2020.nw.r.appspot.com/" + word_).then(function(response){
      return response.status
  })
    return code === 200;
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

  function makeScore(){
    let newScore = `Soldle Score: ${guessedWordCount}/6\n\n`;
    console.log(score.split("\n"));
    for (const line of score.split("\n")){
      console.log(line);
      for (let stat of line.split(",")){
        console.log(stat);
        switch (stat) {
          case "correct": stat = '🟩 '; break; // If correct make tile green
          case "present": stat = '🟨 '; break; // If present make tile yellow
          case "absent": stat = '⬛ '; break; // If absent make tile grey
        }
        newScore += stat
        console.log(stat);
      }
      newScore += '\n'
    }
    console.log(newScore);
    score = newScore;
    navigator.clipboard.writeText(score);
  }


  async function loadFromCookies(){
    let cookies = document.cookie;
    for (ck of cookies.split(' ')) {
      let ckKey = ck.split('=')[0];
      let ckWord = ck.split('=')[1];
      // Load the words from cookies
      if (ckKey.includes('word')){
        for(ckLetter of ckWord){
          if (ckLetter !== ';'){
            updateGuessedWords(ckLetter)
          }
        }
      } // Info modal
      if(!cookies.includes('info=read')){
          infoModal.style.display = "block";
          document.cookie = `info=read;expires=${tomorrowstr}; path=/;`
        }
      await submitWord();
    } 
  }
  

  async function postData(url = '', data = {}) {
    const response = await fetch(url, {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data) // body data type must match "Content-Type" header
    });
    return response.json(); // parses JSON response into native JavaScript objects
  }

})