-- Courses table
-- Stores course catalog information

CREATE TABLE Courses (
    course_id INT PRIMARY KEY,
    course_name TEXT,
    department_id INT,
    credits INT,

    FOREIGN KEY (department_id) REFERENCES Departments(dept_id)
);