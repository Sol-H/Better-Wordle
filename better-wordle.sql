CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DROP TABLE IF EXISTS GuessableWords;

CREATE TABLE IF NOT EXISTS GuessableWords (
    id   wordID      DEFAULT uuid_generate_v4() PRIMARY KEY,
    word  text,
);


DROP TABLE IF EXISTS WinnableWords;

CREATE TABLE IF NOT EXISTS WinnableWords (
    id   wordID      DEFAULT uuid_generate_v4() PRIMARY KEY,
    word  text,
);

COPY GuessableWords FROM 'guessableWords.txt'
COPY WinnableWords FROM 'winnableWords.txt'