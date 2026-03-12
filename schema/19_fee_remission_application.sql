-- Fee Remission Application table
-- Stores applications for fee remission

CREATE TABLE Fee_Remission_Application (
    application_id INT PRIMARY KEY,
    student_id INT,
    status VARCHAR(20),

    FOREIGN KEY (student_id) REFERENCES Students(student_id)
);