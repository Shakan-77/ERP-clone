-- Exam locations for Students

CREATE TABLE Exam_Seating (
    exam_id INT,
    student_id INT,

    PRIMARY KEY (exam_id, student_id)
);