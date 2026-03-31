-- Leave Requests table
-- Stores leave applications submitted by students

CREATE TABLE Leave_Requests (
    request_id INT PRIMARY KEY,
    student_id TEXT,
    start_date DATE,
    end_date DATE,
    reason TEXT,
    status VARCHAR(20)
        CHECK (status IN ('Pending','Approved','Rejected'))
);