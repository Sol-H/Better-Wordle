-- Up    

CREATE TABLE IF NOT EXISTS Words (
            word_id	INTEGER,
            word	TEXT NOT NULL,
            UNIQUE (word),
            PRIMARY KEY(word_id)
            );


-- Down 

DROP TABLE Words; 