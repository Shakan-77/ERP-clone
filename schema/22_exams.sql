-- Exam locations for a course_offering

CREATE TABLE Exams (
    exam_id INT PRIMARY KEY,
    course_offering_id INT NOT NULL,
    room_number VARCHAR(10) NOT NULL,
    building_name VARCHAR(50) NOT NULL,
    date_of_exam DATE NOT NULL
);