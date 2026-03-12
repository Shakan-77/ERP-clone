-- Leave Requests table
-- Stores leave applications submitted by students

CREATE TABLE Leave_Requests (
    request_id INT PRIMARY KEY,
    student_id INT,
    start_date DATE,
    end_date DATE,
    reason TEXT,
    status VARCHAR(20),

    FOREIGN KEY (student_id) REFERENCES Students(student_id)
);