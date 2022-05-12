const keys = [
  'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P',
  'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L',
  '↵', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '←',
];


function createTiles() {
  const board = document.querySelector('#board');
  const tile = document.createElement('div');
  const row = document.createElement('div');
  row.classList.add('board-row');
  tile.classList.add('tile');
  // Create 6 rows
  for (let i = 0; i < 6; i++) {
    board.append(row.cloneNode(true));
  }
  const rows = document.querySelectorAll('.board-row');
  // Add 5 tiles to each row
  for (const row1 of rows) {
    row1.setAttribute('letters', '');
    for (let i = 0; i < 5; i++) {
      row1.append(tile.cloneNode(true));
    }
  }
}

function createKeyboard() {
  const keyRows = document.querySelectorAll('.key-row');
  const keyButton = document.createElement('button');
  for (const key of keys) {
    const newKey = keyButton.cloneNode(true);
    newKey.classList.add('key');
    newKey.textContent = key;
    // Top row of letters
    if (keys.indexOf(key) < 10) {
      keyRows[0].append(newKey);
    }
    // Middle row of letters
    else if (keys.indexOf(key) < 19) {
      keyRows[1].append(newKey);
    }
    // Bottom row of letters
    else {
      keyRows[2].append(newKey);
    }
    // Make backspace and enter larger
    if (keys.indexOf(key) == 19 || keys.indexOf(key) == 27) {
      newKey.classList.add('larger');
    }
  }
}


function typingHandler(typed) {
  const letter = typed.key;
  const rows = document.querySelectorAll('.board-row');
  const row = rows[0];
  const tiles = row.children;
  const wordLength = Object.keys(row.getAttribute('letters')).length;
  if (letter.match(/^[a-z]$/)) {
    if (wordLength < 5) {
      row.setAttribute('letters', row.getAttribute('letters') + letter);
      tiles[0].textContent = letter;
    } else if (letter == 'Backspace') {
      console.log('backspace');
      row.setAttribute('letters', row.getAttribute('letters').slice(0, wordLength - 1));
    }
  }
}

window.onload = (event) => {
  createTiles();
  createKeyboard();
  window.addEventListener('keydown', typingHandler);
  console.log('page is fully loaded');
};
