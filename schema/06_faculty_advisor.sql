-- Faculty Advisor table
-- Maps students to their faculty advisors

CREATE TABLE Faculty_Advisor (
    student_id INT PRIMARY KEY,
    faculty_id INT,

    FOREIGN KEY (student_id) REFERENCES Students(student_id),
    FOREIGN KEY (faculty_id) REFERENCES Faculty(faculty_id)
);