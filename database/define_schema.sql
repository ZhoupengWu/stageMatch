CREATE TABLE IF NOT EXISTS users (
    id TEXT,
    name TEXT,
    email TEXT UNIQUE,
    picture BLOB,

    PRIMARY KEY (id)
)

--CREATE TABLE IF NOT EXISTS user_prefs (

--)