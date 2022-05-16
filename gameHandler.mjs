import * as db from './dbHandler.mjs';

let dailyWord;

makeDailyWord();

async function makeDailyWord() {
  // Gets todays date then creates an ID for it
  const utcDate = (new Date());
  let date = new Date(utcDate);
  date.setTime(date.getTime() + 3600000); // Add one hour because utc time is wrong
  date = date.toISOString().split('T')[0];
  const year = date.split('-')[0];
  const month = date.split('-')[1];
  const day = date.split('-')[2];
  const dayId = ((year * 365) + (month * 31) + day) % 2309; // 2309 is the amount of words in the database

  const word = await db.findWord(dayId);
  dailyWord = word.word;
}


export function checkWord(word) {
  makeDailyWord();
  const wordArr = word.split('');
  const colors = [];
  wordArr.forEach((letter, index) => {
    colors.push(getTileStatus(letter, index, wordArr));
  });
  return colors;
}

// Takes a letter, the index of that letter, and the array of the currentWord being registered
function getTileStatus(typedLetter, index, wordArr) {
  const letterInThatPosition = dailyWord.charAt(index);
  const isCorrectPosition = typedLetter === letterInThatPosition;
  const isCorrectLetter = dailyWord.includes(typedLetter);

  // IF correct position, return correct
  if (isCorrectPosition) {
    return 'correct';
  }

  // Make sure only one square is "present" for multiple present letters
  let firstLetter = true;
  wordArr.forEach((countedLetter, i) => {
    if (countedLetter === typedLetter) {
      if (i < index) {
        firstLetter = false;
      }
    }
  });

  // If the letter is in the word, return yellow
  if (isCorrectLetter && firstLetter) {
    return 'present';
  }

  // Otherwise, return grey
  return 'absent';
}
