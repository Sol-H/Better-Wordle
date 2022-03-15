document.addEventListener("DOMContentLoaded",() =>{
  createTiles();
  createKeyboard();

  let guessedWords = [[]];
  let availableSpace = 1;

  // Add event listeners to each key on the keyboard
  const keys = document.querySelectorAll('.key-row button');

  for (let key of keys){
    key.onclick = ({target}) => {
      const letter = target.getAttribute('data-key');

      updateGuessedWords(letter);
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

        const availableSpaceEl = document.getElementById(String(1));
        availableSpace += 1;

        availableSpaceEl.textContent = letter;
      }
    }

    function createTiles(){
      const board = document.querySelector('#board');
      
        for (let i=0; i < 30; i++){
          let tile = document.createElement("div");
          tile.classList.add("tile");
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