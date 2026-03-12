-- Grades table
-- Stores final grades for each course enrollment

CREATE TABLE Grades (
    student_id INT,
    course_offering_id INT,
    grade VARCHAR(2),

    PRIMARY KEY(student_id, course_offering_id)
);