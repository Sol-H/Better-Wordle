
// Gets todays date then creates an ID for it
let date = new Date().toISOString().split('T')[0];
let year = date.split('-')[0];
let month = date.split('-')[1];
let day = date.split('-')[2];
const dayId = (year+month+day) % 2309; //2309 is the amount of words in the database

const dailyWord = "hello"
console.log(dailyWord);

// // Gets word with the id of the current day
// async function dailyWord(id){
//   const word = await fetch("./getword/" + id).then(response => response.json());
//   return word.word;
// }

export async function checkWord(word){
  const wordArr = word.split('');
  let colors = [];
  wordArr.forEach((letter, index) => {
    colors.push(getTileColor(letter, index, wordArr));
  });
  return colors;
}

// Takes a letter, the index of that letter, and the array of the currentWord being registered
function getTileColor(typedLetter, index, wordArr){

  const letterInThatPosition = dailyWord.charAt(index);
  const isCorrectPosition = typedLetter === letterInThatPosition;
  const isCorrectLetter = dailyWord.includes(typedLetter);

  // IF correct position, return green
  if (isCorrectPosition){
    return "rgb(83, 141, 78)";
  }

  // Make sure only one square is yellow for the same letters
  let letterCount = 0;
  let firstLetter = true;
  wordArr.forEach((countedLetter, i) => {
    if (countedLetter == typedLetter){
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

export function winner(guessedWord){
  return guessedWord === dailyWord;
}