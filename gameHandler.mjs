import * as db from './dbHandler.mjs';

let dailyWord;

makeDailyWord();

async function makeDailyWord(){
  // Gets todays date then creates an ID for it
  let date = new Date().toISOString().split('T')[0];
  let year = date.split('-')[0];
  let month = date.split('-')[1];
  let day = date.split('-')[2];
  const dayId = (year+month+day) % 2309; //2309 is the amount of words in the database

  const word = await db.findWord(dayId);
  dailyWord = word.word;
  console.log(`Todays word: ${dailyWord}`);
}

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

  makeDailyWord();

  const letterInThatPosition = dailyWord.charAt(index);
  const isCorrectPosition = typedLetter === letterInThatPosition;
  const isCorrectLetter = dailyWord.includes(typedLetter);

  // IF correct position, return correct
  if (isCorrectPosition){
    return "correct";
  }

  // Make sure only one square is "present" for multiple present letters
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
    return "present";
  }

  // Otherwise, return grey
  return "absent";
}