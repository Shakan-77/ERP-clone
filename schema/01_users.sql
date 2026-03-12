-- Users table
-- Stores login credentials and roles

CREATE TABLE Users (
    user_id INT PRIMARY KEY,
    password TEXT NOT NULL
        CHECK (
            password ~ '[A-Z]' AND
            password ~ '[0-9]' AND
            password ~ '[^A-Za-z0-9]'
        )
    role VARCHAR(10) CHECK (role IN ('Admin','Faculty','Student'))
);