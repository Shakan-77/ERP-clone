-- Feedback table
-- Stores student feedback for course offerings

CREATE TABLE Feedback (
    student_id INT,
    course_offering_id INT,
    feedback TEXT,

    PRIMARY KEY(student_id, course_offering_id)
);