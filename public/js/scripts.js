document.addEventListener('DOMContentLoaded', () => {
  createTiles();
  createKeyboard();

  let gameOver;
  let score = '';
  const guessedWords = [[]]; // Stores the users guessed words
  let availableSpace = 1; // Used to determine where the most recent letter was typed

  let guessedWordCount = 0;

  // Creates a string for midnight the day after the current date, used for cookies
  const date = new Date();
  const tomorrow = new Date(date);// take away an hour because we are in BST
  // tomorrow.setDate(date.getDate() + 1);
  let tomorrowstr = tomorrow.toString().split(' ');
  tomorrowstr[4] = '23:00:00';
  tomorrowstr.splice(6, 3); // Remove the last parts of the string to fit the standard for cookies
  tomorrowstr = tomorrowstr.join(' ');

  loadFromCookies();

  // Toast stuff

  const toast = document.querySelector('.toast');
  const toastContent = document.querySelector('.toast-content');
  const toastMessage = document.querySelector('#toastMessage');

  // Stats Modal stuff
  const statsModal = document.querySelector('#statsModal');
  const statsClose = document.querySelector('#statsClose');
  const statsBtn = document.querySelector('#stats');
  const statsContentScore = document.querySelector('#statsContentScore');
  const statsContent = document.querySelector('#statsContent');
  const shareBtn = document.querySelector('#shareButton');

  statsBtn.onclick = function () {
    statsModal.style.display = 'block';
  };

  statsClose.onclick = function () {
    statsModal.style.display = 'none';
  };

  window.onclick = function (event) {
    if (event.target === statsModal) {
      statsModal.style.display = 'none';
    }
  };

  shareBtn.onclick = function () {
    copyScore();
    console.log('copied');
  };

  // INfo Modal stuff
  const infoModal = document.querySelector('#infoModal');
  const infoClose = document.querySelector('#infoClose');
  const infoBtn = document.querySelector('#info');


  infoBtn.onclick = function () {
    infoModal.style.display = 'block';
  };

  infoClose.onclick = function () {
    infoModal.style.display = 'none';
  };

  window.onclick = function (event) {
    if (event.target === infoModal) {
      infoModal.style.display = 'none';
    }
  };


  if (!localStorage.getItem('scores')) {
    localStorage.setItem('scores', JSON.stringify({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, fail: 0 }));
  }

  loadStats();

  const keys = document.querySelectorAll('.key-row button');

  addKeyboardClicks();
  window.addEventListener('keydown', typingHandler);

  // Add functionality for typing on physical keyboard
  function typingHandler(event) {
    const letter = event.key;

    if (letter === 'Enter' && !gameOver) {
      submitWord();
      return;
    }

    if (letter === 'Backspace' && !gameOver) {
      deleteLetter();
      return;
    }

    // Make sure only letters are allowed
    if (letter.match(/^[a-z]$/)) {
      updateGuessedWords(letter);
    }
  }

  // Add event listeners to each key on the on screen keyboard
  function addKeyboardClicks() {
    for (const key of keys) {
      key.onclick = ({ target }) => {
        const letter = target.getAttribute('data-key');

        if (letter === 'enter') {
          submitWord();
          return;
        }

        if (letter === 'del' && !gameOver) {
          deleteLetter();
          return;
        }

        updateGuessedWords(letter);
      };
    }
  }

  async function submitWord() {
    const currentWordArr = getCurrentWordArr();

    // Make sure the word is 5 letters long
    if (currentWordArr.length !== 5) {
      Toast('Word is too short!');
      return;
    }

    let currentWord = currentWordArr.join('');

    const isRealWord = await checkRealWord(currentWord);

    // Make sure the word is in the dictionary
    if (!isRealWord) {
      Toast('Not in the word list!');
      return;
    }

    const firstLetterId = guessedWordCount * 5 + 1;
    const interval = 200;

    // Get status of the guess from the server
    const results = await postData('/checkword', { word: currentWord })
      .then(data => {
        return data; // JSON data parsed by `data.json()` call
      });

    score += results.toString() + '\n';

    // Set colours and animations for the current word
    currentWordArr.forEach((letter, index) => {
      setTimeout(() => {
        // Change the colors of tiles based on guess
        const letterId = firstLetterId + index;
        const letterEl = document.getElementById(letterId);

        const result = results[index]; // Set the correct color for the tile

        let tileColor = 'rgb(83, 141, 78)';
        //
        switch (result) {
          case 'correct': tileColor = 'rgb(83, 141, 78)'; break; // If correct make tile green
          case 'present': tileColor = 'rgb(181, 159, 59)'; break; // If present make tile yellow
          case 'absent': tileColor = 'rgb(58,58,60)'; break; // If absent make tile grey
        }

        letterEl.classList.add('animate__flipInX');
        letterEl.style = `outline-color:${tileColor};background-color:${tileColor};`;

        // Change the colors of keyboard buttons based on guess
        const letterKeyEl = document.querySelector(`[data-key="${letter}"]`);
        letterKeyEl.style = `background-color:${tileColor};`;
      }, interval * index);
    });

    guessedWordCount += 1;

    // Check if the word is a winner by checking status of all the letters in the guess
    // The rest of this if statement, loads in the stats.
    if (String(results) === 'correct,correct,correct,correct,correct') {
      // Add cookie for the final word
      document.cookie = `word${guessedWords.length}=${currentWord}; expires=${tomorrowstr}; path=/;`;
      // Add cookie for the game over status, so scores cant be saved twice
      document.cookie = `gameOver=true; expires=${tomorrowstr}; path=/;`;
      // Makes stats modal visible
      statsModal.style.display = 'block';

      if (!gameOver) {
        const scores = JSON.parse(localStorage.getItem('scores'));
        scores[guessedWordCount] = scores[guessedWordCount] + 1;
        localStorage.setItem('scores', JSON.stringify(scores));
      }

      statsContentScore.textContent = `Soldle Score: ${guessedWordCount}/6`;

      Toast('You win!');
      currentWord = '';
      gameOver = true;
      return;
    }

    if (guessedWords.length === 6) {
      Toast('No more guesses');
      // Add cookie for the final word
      document.cookie = `word${guessedWords.length}=${currentWord}; expires=${tomorrowstr}; path=/;`;
      // Add a fail to the stats in local storage
      const scores = JSON.parse(localStorage.getItem('scores'));
      scores.fail = scores[guessedWordCount] + 1;
      localStorage.setItem('scores', JSON.stringify(scores));
      statsModal.style.display = 'block';
      gameOver = true;
      guessedWordCount = 'X';
      statsContentScore.textContent = `Soldle Score: ${guessedWordCount}/6`;
      return;
    }

    const guessedLen = guessedWords.push([]);

    // Creates cookie so that data is saved until the next day
    document.cookie = `word${guessedLen - 1}=${currentWord}; expires=${tomorrowstr}; path=/;`;
  }

  async function checkRealWord(word_) {
    const code = await fetch('https://dictionary-dot-sse-2020.nw.r.appspot.com/' + word_).then(function (response) {
      return response.status;
    });
    return code === 200;
  }

  function deleteLetter() {
    const currentWordArr = getCurrentWordArr();
    if (currentWordArr.length > 0) {
      currentWordArr.pop();
      guessedWords[guessedWords.length - 1] = currentWordArr;

      const lastLetterEl = document.getElementById(String(availableSpace - 1));

      lastLetterEl.textContent = '';
      lastLetterEl.style = 'outline-color:#272729';
      availableSpace = availableSpace - 1;
    }
  }

  function getCurrentWordArr() {
    const numberOfGuessedWords = guessedWords.length;
    return guessedWords[numberOfGuessedWords - 1];
  }

  function updateGuessedWords(letter) {
    const currentWordArr = getCurrentWordArr();
    if (currentWordArr && currentWordArr.length < 5) {
      currentWordArr.push(letter);
      const availableSpaceEl = document.getElementById(String(availableSpace));
      availableSpace += 1;
      availableSpaceEl.style = 'outline-color:rgb(58,58,60)';
      availableSpaceEl.textContent = letter;
    }
  }


  function createTiles() {
    const board = document.querySelector('#board');

    for (let i = 0; i < 30; i++) {
      const tile = document.createElement('div');
      tile.classList.add('tile');
      tile.classList.add('animate__animated');
      tile.setAttribute('id', i + 1);
      board.append(tile);
    }
  }

  function createKeyboard() {
    const keyLetters = [
      'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p',
      'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l',
      'enter', 'z', 'x', 'c', 'v', 'b', 'n', 'm', 'del',
    ];

    for (const key of keyLetters) {
      const keyRows = document.querySelectorAll('.key-row');
      const newKey = document.createElement('button');

      newKey.setAttribute('data-key', key);
      newKey.textContent = key;

      // Top row of letters
      if (keyLetters.indexOf(key) < 10) {
        keyRows[0].append(newKey);
      // Middle row of letters
      } else if (keyLetters.indexOf(key) < 19) {
        keyRows[1].append(newKey);
      // Bottom row of letters
      } else {
        keyRows[2].append(newKey);
      }
      // Make backspace and enter larger
      if (keyLetters.indexOf(key) === 19 || keyLetters.indexOf(key) === 27) {
        newKey.classList.add('larger');
      }
    }
  }


  function copyScore() {
    let emojiScore = `Soldle Score: ${guessedWordCount}/6\n\n`;
    for (const line of score.split('\n')) {
      for (let stat of line.split(',')) {
        switch (stat) {
          case 'correct': stat = '🟩 '; break; // If correct make tile green
          case 'present': stat = '🟨 '; break; // If present make tile yellow
          case 'absent': stat = '⬛ '; break; // If absent make tile grey
        }
        emojiScore += stat;
      }
      emojiScore += '\n';
    }
    console.log(emojiScore);

    navigator.clipboard.writeText(emojiScore);
    Toast('Score copied');
  }

  // This function loads the stats from localStorage, then displays them in the statistics modal.
  function loadStats() {
    const stats = JSON.parse(localStorage.getItem('scores'));
    const played = getTimesPlayed(stats);
    const playedElem = document.createElement('h3');
    playedElem.textContent = `Games Played, ${played}.`;

    const guessDist = document.createElement('p');
    guessDist.textContent = 'Guess Distribution:';

    statsContent.append(playedElem);
    statsContent.append(guessDist);
    shareBtn.style.display = 'block';

    for (let i = 1; i < 8; i++) {
      // Create an SVG element for the bar chart
      const group = document.createElement('g');
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      const lineBreak = document.createElement('br');
      // Get the number for the current stat (will affect length of barchart)
      let stat = JSON.stringify(stats[`${i}`]);
      if (!stat) {
        stat = JSON.stringify(stats.fail);
      }
      svg.setAttribute('height', '30px');
      svg.setAttribute('width', `${stat * 10}px`);
      svg.setAttribute('viewBox', `0 0 30 ${stat * 10}`);
      svg.style = 'border-radius:5px; ';

      const statText = document.createElement('text');
      if (i !== 7) {
        statText.textContent = i;
      } else {
        statText.textContent = 'X';
      }
      const svgAmount = document.createElement('text');
      svgAmount.textContent = stat;

      group.append(statText);
      group.append(svg);
      group.append(svgAmount);
      group.append(lineBreak);
      statsContent.append(group);
    }
  }

  function getTimesPlayed(stats) {
    let times = 0;
    // Adds all the values of the stats together, to get the amoutn of times played
    for (const [, stat] of Object.entries(stats)) {
      times += stat;
    }
    return times;
  }

  function Toast(message) {
    toast.style.display = 'block';
    toastMessage.textContent = message; // Show toast
    setTimeout(() => {
      toastContent.classList.add('animate__fadeOutUp'); // Adds animation to show toast fading away
    }, 1000);
    setTimeout(() => {
      toast.style.display = 'none';
      toastContent.classList.remove('animate__fadeOutUp');
    }, 1200);
  }


  async function loadFromCookies() {
    const cookies = document.cookie;
    for (const ck of cookies.split(' ')) {
      const ckKey = ck.split('=')[0];
      const ckWord = ck.split('=')[1];
      // Load the words from cookies
      if (ckKey.includes('word')) {
        for (const ckLetter of ckWord) {
          if (ckLetter !== ';') {
            updateGuessedWords(ckLetter);
          }
        }
        await submitWord();
      } // Info modal
      if (!cookies.includes('info=read')) {
        infoModal.style.display = 'block';
        document.cookie = `info=read;expires=${tomorrowstr}; path=/;`;
      }
      if (!cookies.includes('gameOver=true')) {
        gameOver = false;
      } else {
        gameOver = true;
      }
    }
  }


  async function postData(url = '', data = {}) {
    const response = await fetch(url, {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data), // body data type must match "Content-Type" header
    });
    return response.json(); // parses JSON response into native JavaScript objects
  }
});
