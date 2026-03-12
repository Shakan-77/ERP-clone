-- On Leave table
-- Tracks approved leave periods for students

CREATE TABLE On_leave (
    student_id INT,
    start_date DATE,
    end_date DATE,
    request_id INT,

    PRIMARY KEY(student_id, start_date),

    FOREIGN KEY (student_id) REFERENCES Students(student_id),
    FOREIGN KEY (request_id) REFERENCES Leave_Requests(request_id)
);