-- This query retrieves all records from the Student_SGPA table where the semester matches the semester of the corresponding student in the Students table.

SELECT *
FROM Student_SGPA
WHERE semester = (
    SELECT semester FROM Students WHERE student_id = Student_SGPA.student_id
);