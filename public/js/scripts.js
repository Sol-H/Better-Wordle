window.onload = (event) => {
  console.log('page is fully loaded');
  createTiles();
};

function createTiles(){
  const board = document.querySelector('#board');
  const tile = document.createElement('div');
  const row = document.createElement('div');
  row.id = 'board-row';
  tile.id = 'tile';
  // Create rows
  for (let i = 0; i < 6; i++){
    board.append(row.cloneNode(true));
  }
  const rows = document.querySelectorAll('#board-row');
  // Add 5 tiles to each row
  for (let row1 of rows){
    for (let i = 0; i < 5; i++){
      row1.append(tile.cloneNode(true));
    }
  }
}