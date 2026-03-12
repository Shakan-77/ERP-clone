-- Rooms table
-- Stores classroom details

CREATE TABLE Rooms (
    building_name TEXT,
    room_number INT,
    capacity INT,

    PRIMARY KEY(building_name, room_number)
);