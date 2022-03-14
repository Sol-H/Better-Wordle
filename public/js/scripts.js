const keys = [
  'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P',
   'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L',
  '↵','Z', 'X', 'C', 'V', 'B', 'N', 'M', '←'
]



function createTiles(){
  const board = document.querySelector('#board');
  const tile = document.createElement('div');
  const row = document.createElement('div');
  row.classList.add('board-row');
  tile.classList.add('tile');
  // Create 6 rows
  for (let i = 0; i < 6; i++){
    board.append(row.cloneNode(true));
  }
  const rows = document.querySelectorAll('.board-row');
  // Add 5 tiles to each row
  for (let row1 of rows){
    row1.setAttribute("letters", "");
    for (let i = 0; i < 5; i++){
      row1.append(tile.cloneNode(true));
    }
  }
}

function createKeyboard(){
  const keyRows = document.querySelectorAll('.key-row')
  const keyButton = document.createElement('button');
  for (const key of keys){
    let newKey = keyButton.cloneNode(true);
    newKey.classList.add('key');
    newKey.textContent = key;
    // Top row of letters
    if(keys.indexOf(key)<10){
      keyRows[0].append(newKey);
    }
    // Middle row of letters
    else if(keys.indexOf(key)<19){
      keyRows[1].append(newKey);
    }
    // Bottom row of letters
    else{
      keyRows[2].append(newKey);
    }
    // Make backspace and enter larger
    if (keys.indexOf(key) == 19 || keys.indexOf(key) == 27){
      newKey.classList.add("larger");
    }
  }
}

function playGame(){
  const rows = document.querySelectorAll('.board-row');
  let currentRow = rows[0];
  const tiles = currentRow.children;
  let currentTile = tiles[0];
  window.addEventListener("keydown", typingHandler);


}


function typingHandler(typed){
  const letter = typed.key;
  
  console.log(currentRow, currentTile);

  let wordLength = Object.keys(currentRow.getAttribute("letters")).length;
    if (letter.match(/^[a-z]$/)){
      if (wordLength < 5){
        currentRow.setAttribute("letters", row.getAttribute('letters') + letter);
        currentTile.textContent = letter;  
      }
      
    else if (letter == 'Backspace'){
        console.log("backspace");
        row.setAttribute("letters", row.getAttribute("letters").slice(0, wordLength-1));
      }
  }
}

window.onload = (event) => {
  createTiles();
  createKeyboard();
  playGame();
  console.log('page is fully loaded');
};
