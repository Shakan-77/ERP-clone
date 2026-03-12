-- Backlogs table
-- Tracks courses that students must retake

CREATE TABLE Backlogs (
    student_id INT,
    course_id INT,

    PRIMARY KEY(student_id, course_id)
);