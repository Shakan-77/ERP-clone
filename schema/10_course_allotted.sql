-- Course Allotted table
-- Stores course enrollment and marks

CREATE TABLE Course_Alloted (
    student_id INT,
    course_offering_id INT,
    mid_sem_marks INT,
    end_sem_marks INT,

    PRIMARY KEY(student_id, course_offering_id)
);