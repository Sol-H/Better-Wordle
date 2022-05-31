document.addEventListener('DOMContentLoaded', () => {
  createTiles();
  createKeyboard();

  // Value updated depending on the gameOver cookie; makes sure localStorage is only written to once
  let gameOver;
  // Used to make the emojiScore; updated with each word guess.
  let score = '';
  // Stores the users guessed words
  const guessedWords = [[]];
  // Used to determine where the most recent letter was typed
  let currentTileId = 1;
  let guessedWordCount = 0;

  // Creates a string for midnight the day after the current date, used for cookies
  const date = new Date();
  // Make array of date
  let tomorrow = date.toString().split(' ');
  // Set the time to 11pm of current date (This is because we are 1 hour ahead due to summer time)/
  tomorrow[4] = '23:00:00';
  // Remove the last parts of the string to fit the standard for cookies
  tomorrow.splice(6, 3);
  tomorrow = tomorrow.join(' ');

  // Toast elements (Toast is the notifications that pop up)
  const toast = document.querySelector('.toast');
  const toastMessage = document.querySelector('#toastMessage');

  // Stats Modal elements
  const statsModal = document.querySelector('#statsModal');
  const statsClose = document.querySelector('#statsClose');
  const statsBtn = document.querySelector('#stats');
  const statsContentScore = document.querySelector('#statsContentScore');
  const statsContent = document.querySelector('#statsContent');
  const shareBtn = document.querySelector('#shareButton');

  statsBtn.onclick = function () {
    // Show the modal when the stats button is clicked.
    statsModal.style.display = 'block';
  };

  statsClose.onclick = function () {
    // Hide the modal when the close button is clicked.
    statsModal.style.display = 'none';
  };

  window.onclick = function (event) {
    // Hide the modal if clicked behind it.
    if (event.target === statsModal) {
      statsModal.style.display = 'none';
    }
  };

  shareBtn.onclick = function () {
    // Copies the emojis for the score to the users clipboard.
    copyScore();
    console.log('copied');
  };

  // Info modal elements.
  const infoModal = document.querySelector('#infoModal');
  const infoClose = document.querySelector('#infoClose');
  const infoBtn = document.querySelector('#info');

  infoBtn.onclick = function () {
    // Show info modal when button clicked
    infoModal.style.display = 'block';
  };

  infoClose.onclick = function () {
    // Hide modal when close button clicked
    infoModal.style.display = 'none';
  };

  window.onclick = function (event) {
    if (event.target === infoModal) {
      // Hide modal when clicked behind.
      infoModal.style.display = 'none';
    }
  };

  // If there are no scores in the local storage, set all values to 0.
  if (!localStorage.getItem('scores')) {
    localStorage.setItem('scores', JSON.stringify({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, fail: 0 }));
  }
  // If there are no streak in the local storage, set to 0.
  if (!localStorage.getItem('streak')) {
    localStorage.setItem('streak', JSON.stringify({ amount: 0 }));
  }

  // Iterates through cookies, and loads the typed words, gameOver and info into the game.
  loadFromCookies();

  // Loads the stats from localStorage, then displays them in the statistics modal.
  loadStats();

  // Gets alements for keyboard
  const keys = document.querySelectorAll('.key-row button');

  // Makes all the keyboard buttons clickable.
  addKeyboardClicks();
  // Makes user able to type on physical keyboard
  window.addEventListener('keydown', typingHandler);

  // Add functionality for typing on physical keyboard
  function typingHandler(event) {
    const letter = event.key;

    if (letter === 'Enter' && !gameOver) {
      // Checks contents of the currentWordArr and make decisions based on it. (If its a real word etc)
      submitWord();
      return;
    }

    if (letter === 'Backspace' && !gameOver) {
      // Removes letter from the tile and makes the currentTile id less
      deleteLetter();
      return;
    }

    // Make sure only letters are allowed.
    if (letter.match(/^[a-z]$/)) {
      // Append letter to the current word array.
      pushGuessedWords(letter);
    }
  }

  // Add event listeners to each key on the on screen keyboard
  function addKeyboardClicks() {
    for (const key of keys) {
      key.onclick = ({ target }) => {
        const letter = target.getAttribute('data-key');

        if (letter === 'enter' && !gameOver) {
          submitWord();
          return;
        }

        if (letter === 'del' && !gameOver) {
          deleteLetter();
          return;
        }

        pushGuessedWords(letter);
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

    // The id will change depending on which row the first letter is on.
    const firstLetterId = guessedWordCount * 5 + 1;
    // Time between each letter showing up
    const interval = 250;

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

        let tileColor = 'rgb(58,58,60)'; // Grey by default
        //
        switch (result) {
          case 'correct': tileColor = 'rgb(83, 141, 78)'; break; // If correct make tile green
          case 'present': tileColor = 'rgb(181, 159, 59)'; break; // If present make tile yellow
          case 'absent': break; // If absent keep tile grey
        }

        // Make tile flip when colour is shown
        letterEl.classList.add('flip-tile');
        letterEl.style = `outline-color:${tileColor};background-color:${tileColor};`;

        // Change the colors of keyboard buttons based on guess
        const letterKeyEl = document.querySelector(`[data-key="${letter}"]`);
        // Check if already colored
        if (!letterKeyEl.style.backgroundColor) {
          letterKeyEl.style = `background-color:${tileColor};`;
        } else {
          // Only change the color, if it is not already colored a less important color (e.g. if it should be green but is yellow)
          switch (letterKeyEl.style.backgroundColor) {
            case 'rgb(83, 141, 78)': break;
            // Only change color if it is not green
            case 'rgb(181, 159, 59)': if (result === 'correct') { letterKeyEl.style = `background-color:${tileColor};`; } break;
            case 'rgb(58,58,60)': letterKeyEl.style = `background-color:${tileColor};`; break;
          }
        }
      }, interval * index);
    });

    guessedWordCount += 1;

    // Check if the word is a winner by checking status of all the letters in the guess
    // The rest of this if statement, loads in the stats.
    if (String(results) === 'correct,correct,correct,correct,correct') {
      // Add cookie for the final word
      document.cookie = `word${guessedWords.length}=${currentWord}; expires=${tomorrow}; path=/;`;
      // Add cookie for the game over status, so scores cant be saved twice
      document.cookie = `gameOver=true; expires=${tomorrow}; path=/;`;
      // Makes stats modal visible
      setTimeout(() => {
        statsModal.style.display = 'block';
      }, 2000);

      if (!gameOver) {
        const scores = JSON.parse(localStorage.getItem('scores'));
        const streak = JSON.parse(localStorage.getItem('streak'));
        streak.amount = streak.amount + 1;
        scores[guessedWordCount] = scores[guessedWordCount] + 1;
        localStorage.setItem('scores', JSON.stringify(scores));
        localStorage.setItem('streak', JSON.stringify(streak));
      }

      statsContentScore.textContent = `Soldle Score: ${guessedWordCount}/6`;

      // Display share button.
      shareBtn.style.display = 'block';

      Toast('You win!');
      currentWord = '';
      gameOver = true;
      return;
    }

    if (guessedWords.length === 6) {
      Toast('No more guesses');
      // Add cookie for the final word
      document.cookie = `word${guessedWords.length}=${currentWord}; expires=${tomorrow}; path=/;`;
      // Add a fail to the stats in local storage
      const scores = JSON.parse(localStorage.getItem('scores'));
      scores.fail = scores.fail + 1;
      localStorage.setItem('scores', JSON.stringify(scores));
      localStorage.setItem('streak', JSON.stringify({ amount: 0 }));
      // Show the stats modal
      setTimeout(() => {
        statsModal.style.display = 'block';
      }, 1250);

      gameOver = true;
      guessedWordCount = 'X';
      statsContentScore.textContent = `Soldle Score: ${guessedWordCount}/6`;

      // Display share button.
      shareBtn.style.display = 'block';
      return;
    }

    const guessedLen = guessedWords.push([]);

    // Creates cookie so that data is saved until the next day
    document.cookie = `word${guessedLen - 1}=${currentWord}; expires=${tomorrow}; path=/;`;
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

      const currentTile = document.getElementById(String(currentTileId - 1));

      currentTile.textContent = '';
      currentTile.style = 'outline-color: #565758;';
      currentTileId = currentTileId - 1;
    }
  }

  function getCurrentWordArr() {
    const numberOfGuessedWords = guessedWords.length;
    return guessedWords[numberOfGuessedWords - 1];
  }

  function pushGuessedWords(letter) {
    // Array of the current word being typed.
    const currentWordArr = getCurrentWordArr();
    if (currentWordArr && currentWordArr.length < 5) {
      // Pushes letter being typed into the currentWordArr.
      currentWordArr.push(letter);
      // Uses availableSpace variable to get the tile element.
      const currentTile = document.getElementById(String(currentTileId));
      // Increments available space so that the next tile can be used next time
      currentTileId += 1;
      // Makes outline colour a different shade to show tile is typed.
      currentTile.style = 'outline-color:#818384';
      // Put the current typed letter into the tile.
      currentTile.textContent = letter;
    }
  }

  // Creates a 5x6 grid of tiles.
  function createTiles() {
    const board = document.querySelector('#board');

    for (let i = 0; i < 30; i++) {
      const tile = document.createElement('div');
      tile.classList.add('tile');
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
    // Get stats from localStorage
    const scores = JSON.parse(localStorage.getItem('scores'));
    const winStreak = JSON.parse(localStorage.getItem('streak'));
    const played = getTimesPlayed(scores);
    const winPercent = getWinPercent(scores);
    const averageScore = getAverageScore(scores);
    const highestAmount = scores[averageScore];

    // Make elements for stats
    const streakElem = document.createElement('h3');
    const playedElem = document.createElement('h3');
    const winPercentElem = document.createElement('h3');
    const guessDist = document.createElement('p');
    playedElem.textContent = `Games played, ${played}.`;
    streakElem.textContent = `Current win streak, ${winStreak.amount}.`;
    winPercentElem.textContent = `Win percentage, ${winPercent}%.`;
    guessDist.textContent = 'Guess distribution,';

    // Append the stats to the stats modal.
    statsContent.append(playedElem);
    statsContent.append(streakElem);
    statsContent.append(winPercentElem);
    statsContent.append(guessDist);

    for (let i = 1; i < 8; i++) {
      // Create an SVG element for the bar chart
      const group = document.createElement('g');
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      const lineBreak = document.createElement('br');
      // Get the number for the current stat (will affect length of barchart)
      let stat = JSON.stringify(scores[`${i}`]);
      if (!stat) {
        stat = JSON.stringify(scores.fail);
      }
      let barLength = (stat / highestAmount) * 350;
      if (!barLength) {
        barLength = 5;
      }
      svg.setAttribute('height', '30px');
      svg.setAttribute('width', `${barLength}px`);
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

  function getAverageScore(scores) {
    // set maximum value to 0 and maxKey to an empty string
    let max = 0;
    let averageScore = '';

    for (const [score] of Object.entries(scores)) {
      if (scores[score] > max) {
        max = scores[score];
        averageScore = score;
      }
    }
    return String(averageScore);
  }

  function getTimesPlayed(scores) {
    let times = 0;
    // Adds all the values of the stats together, to get the amoutn of times played
    for (const [, stat] of Object.entries(scores)) {
      times += stat;
    }
    return times;
  }

  function getWinPercent(scores) {
    let wins = 0;
    let losses = 0;
    // Adds all the values of the wins together, and all losses together
    for (const [score, stat] of Object.entries(scores)) {
      if (score === 'fail') {
        losses += stat;
      } else {
        wins += stat;
      }
    }
    // Calculate percentage rounded to 1 decimal place
    const percentage = Math.round(wins / (wins + losses) * 1000) / 10;
    if (!percentage) {
      return 0;
    } else {
      return percentage;
    }
  }

  function Toast(message) {
    toast.style.display = 'block';
    toastMessage.textContent = message; // Show toast
    setTimeout(() => {
      toast.style.display = 'none';
    }, 1500);
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
            pushGuessedWords(ckLetter);
          }
        }
        await submitWord();
      } // Info modal
      if (!cookies.includes('info=read')) {
        infoModal.style.display = 'block';
        document.cookie = `info=read;expires=${tomorrow}; path=/;`;
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
