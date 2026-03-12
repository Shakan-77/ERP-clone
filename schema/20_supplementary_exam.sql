-- Supplementary Exams table
-- Stores supplementary exam registrations

CREATE TABLE Supplementary_exams (
    student_id INT,
    course_offering_id INT,
    price NUMERIC,

    PRIMARY KEY(student_id, course_offering_id)
);