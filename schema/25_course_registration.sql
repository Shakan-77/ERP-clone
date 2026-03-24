-- Course Registration table

CREATE TABLE Course_Registration (
    student_id INT,
    course_id INT,
    semester INT,
    selected BOOLEAN DEFAULT TRUE,
    approved BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (student_id, course_id, semester)
);