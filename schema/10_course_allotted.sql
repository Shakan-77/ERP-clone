-- Course Allotted table
-- Stores course enrollment and marks

CREATE TABLE Course_Alloted (
    student_id INT,
    course_offering_id INT,
    mid_sem_marks INT,
    end_sem_marks INT,

    PRIMARY KEY(student_id, course_offering_id),

    FOREIGN KEY (student_id) REFERENCES Students(student_id),
    FOREIGN KEY (course_offering_id) REFERENCES Course_Offerings(course_offering_id)
);