-- Grades table
-- Stores final grades for each course enrollment

CREATE TABLE Grades (
    student_id INT,
    course_offering_id INT,
    grade INT CHECK (grade BETWEEN 0 AND 10),

    PRIMARY KEY(student_id, course_offering_id)
);