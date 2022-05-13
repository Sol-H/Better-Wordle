# Soldle (A better wordle)

Soldle is a version of wordle, which stores words on a database, rather than the client.

The way it does this, is a POST request is sent from the client to the database, containing the guessed word to be checked against the daily word.
This README will go into detail about how this is done.

## Installation

After cloning the repo, all you need is to do these steps.

Make sure that the python command works, as it is needed to build my modules.

```shell
npm install
```

Then to run the server,

```shell
npm start
```

## The Backend

When the server starts, the server.mjs file is run. This uses express to create a server

The 'public' directory is used by the app for the client (static).
This contains the index.html, scripts.js, the css, and the assets for the web app.

A POST endpoint is also made in the server.mjs at '/checkword'. This will be used later by the client to send over the word which needs to be checked.

*'/checkword'* runs a function called ```gameHandler.checkWord(word)```. As you can see, i have another file called gameHandler.mjs that handles this.

*gameHandler.mjs* is imported as gameHandler into the server.mjs file. It generates the daily word id by getting todays date, adding the year, month and day together, then getting the remainder of that value when divided by the length of the database (in this case 2309).
This ensures that the word changes daily, and it reverts back to 0 once it exceeds the length of the database.

This value, we call *dayId*, is then sent to a function (called *findWord(id)*) in another file called *dbHandler.mjs* (which is imported into the gameHandler).

*dbHandler.mjs* creates the database using the migrations directory. This directory contains the sql migration files for the database.

When initialised, the database has an empty table called Words, then a *populateDb()* function is ran which iterates through a *words.txt* file and adds each word to the database with a corresponding id (starting with 0).

Back to the *findWord(id)* function, when this is called, the word with the corresponding id parsed in gets taken from the database and returned.

In the *gameHandler.mjs* the function *checkWord* creates the daily word again (in case the day has changed since the server has started), then checks each letter of the word being checked, with the daily word.

An array is made with all the statuses resembling 'correct' (will be green), 'present' (will be yellow) and 'absent' (will be grey). Each of these statuses in the array is in the position for each corresponding letter.

## The Frontend

The front end consists of all the files in the */public* directory, namely:

* *index.html*
* *styles.css*
* *scripts.js*

The other files in this directory are assets. I have SVG files for the info, share, and stats buttons. I also have a favicon to display an icon in the tab on the browser.

*index.html* is the index of the website, and contains the basic elements that I need for the website to work.

It has the stats modal (A popup containing stats), info modal, and an element with the class "toast". All of which are mostly empty, to be populated using javascript.

*styles.css* has all the styling for the web app, including animations.

*scripts.js* holds all of the logic for the frontend, this is where I will go in depth.

It starts only after the DOM content is loaded, and by initialising all of the variables that will be important. It also defines the elements that will be edited and functions that activate when things are clicked.

I use a mixture of cookies and local storage. Cookies are used for data that should expire the day after, and local storage is used for data that should stay forever.

This means that the cookies contain:

* Words guessed by the user for that day
* Whether the info modal has been read
* Whether they have already finished a game today (So that streak and stats cannot be updated twice)

The local storage contains the stats of the user's play history (how many times they got each score and their win streak).

### How the basic gameplay works

Initially an array called ```guessedWords``` is created, which starts of containing one empty array (so it looks like ```[[]]```). The reason for this is that each word is going to be stored as an array of letters, which will the be stored in this variable.

A variable called currentTileId is created, starting with the value of 1. This is because all of the tiles in my game each have an id starting wih 1 and ending with 30 (5 tiles for each row, 6 rows).

The user can type, either by using their physical keyboard, or clicking on the on-screen keyboard keys.

When a letter is typed, first it is checked if the letter is 'enter', then if it is 'backspace' or if it just a normal letter(it excludes other numbers or symbols).

If it is a normal letter, a function is run called *pushGuessedWords(letter)*. This function gets the current word array, which is inside of the guessedWords array. If the current word array is less than 5 letters long, the letter is pushed to the current word array,
the current tile's textContent (using currentTileId) is updated to that letter and the currentTileId increments.

If the user presses 'enter', the submitWord() function is called. This first, checks if the word is too short, then checks if it is a real word.

The way a word is checked to be real is by using this dictionary: <https://dictionary-dot-sse-2020.nw.r.appspot.com/>. A get request is sent, and if it returns 'OK', then the word is real.

If the word is confirmed to be real, it is the compared against the winning word! The way this is done, is by sending a POST request to '/checkword' (This POST endpoint was described in the backend), with the word as the payload.

After sending the post request, an array is returned to scripts.js containing the status of each letter in the word.

The letters in the word being guessed are iterated through and each tile is changed to the colour corresponding to 'correct' (green), 'present' (yellow), 'absent' (grey).

The tiles are also animated individually by adding a class I created in the css.

If the results array is seen as ```['correct', 'correct', 'correct', 'correct', 'correct']```, the game is over, and some things with the local storage and cookies happen (which I will go into in a bit).

If the amount of guessed words in the guessedWords array is 6, the user loses.

### Some more advanced features

As mentioned before, cookies and local storage are both used.

When the website is opened, the cookies check whether there are any words that have been typed, if the info modal has been read, and whether they have finished a game. This is all done in the ```loadFromCookies()``` function.

All these cookies are set to expire at 00:00 the day after.

If there are words that have been typed before, the words will iteratively be put into the ```pushGuessedWords``` function (letter by letter), the the submitWord() function is run after each word. This ends up looking like a little robot is playing the game really fast which I find cool.

The first time the user goes on the website, a cookie is made called 'info=read', without that cookie the info modal pops up, telling them how to play the game. This results in the modal only opening up once, and then they can open it again if they please, otherwise it stays hidden.

When the user finishes the game, a cookie: 'gameOver=true' is created, this is so that the statistics are only updated once.
Simply, if the gameOver cookie is there, the stats will not be updated.

This leads me on to the user's statistics.

After the page is loaded, the local storage is checked to see if there are any stats. If there is not, they are all set to 0. However, if there are stats they are read and used to be shown in the stats modal.

The stats modal contains the stats:

* Soldle score (a number /6, the amount of goes the user took to win).
* A games played number.
* Their current win streak.
* Win percentage.
* Guess distribution, shown as a bar chart.
* Share button which copies the users guesses for that game onto the clipboard, in the form of emojis.

The one glaring issue I have with my statistics modal, is that the values do not update until the user refreshes. I have a little notice on the buttom informing them of this though.

Luckily, when the user refreshes (if it is the same day of course), the stats modal pops right up, as the cookies are loaded.
