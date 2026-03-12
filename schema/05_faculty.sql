-- Faculty table
-- Stores faculty member details

CREATE TABLE Faculty (
    faculty_id INT PRIMARY KEY,
    contact_no VARCHAR(10),
    email TEXT,
    department_id INT,

    FOREIGN KEY (faculty_id) REFERENCES Users(user_id),
    FOREIGN KEY (department_id) REFERENCES Departments(dept_id)
);