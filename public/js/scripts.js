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
  // Create rows
  for (let i = 0; i < 6; i++){
    board.append(row.cloneNode(true));
  }
  const rows = document.querySelectorAll('.board-row');
  // Add 5 tiles to each row
  for (let row1 of rows){
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

window.onload = (event) => {
  createTiles();
  createKeyboard();
  console.log('page is fully loaded');
};