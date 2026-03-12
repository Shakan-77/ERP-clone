-- Attendance table
-- Stores attendance records for each class session

CREATE TABLE Attendance (
    student_id INT,
    course_offering_id INT,
    class_date DATE,
    status VARCHAR(10),

    PRIMARY KEY(student_id, course_offering_id, class_date),

    FOREIGN KEY (student_id) REFERENCES Students(student_id),
    FOREIGN KEY (course_offering_id) REFERENCES Course_Offerings(course_offering_id)
);