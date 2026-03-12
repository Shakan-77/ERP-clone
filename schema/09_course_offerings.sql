-- Course Offerings table
-- Represents a specific offering of a course in a semester

CREATE TABLE Course_Offerings (
    course_offering_id INT PRIMARY KEY,
    faculty_id INT,
    course_id INT,
    semester INT,
    discipline_id TEXT,
    capacity INT,

    FOREIGN KEY (faculty_id) REFERENCES Faculty(faculty_id),
    FOREIGN KEY (course_id) REFERENCES Courses(course_id),
    FOREIGN KEY (discipline_id) REFERENCES Discipline(discipline_id)
);