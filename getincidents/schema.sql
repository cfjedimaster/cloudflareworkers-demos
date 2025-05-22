DROP TABLE IF EXISTS incidents;
CREATE TABLE IF NOT EXISTS incidents (recordId INTEGER PRIMARY KEY, location TEXT, latitude DOUBLE, longitude DOUBLE, cause TEXT, reported TEXT, date_reported INTEGER, assisting TEXT);
