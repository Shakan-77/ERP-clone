--Registration options for Students

CREATE VIEW Student_Registration_View AS
SELECT
    cr.student_id,
    co.course_offering_id,
    c.course_id,
    c.course_name,
    co.semester,
    f.faculty_id,
    f.faculty_name,
    cr.approved
FROM Course_Registration cr
JOIN Course_Offerings co
    ON cr.course_id = co.course_id
JOIN Courses c
    ON co.course_id = c.course_id
JOIN Faculty f
    ON co.faculty_id = f.faculty_id;


-- Student_Registered_Courses(after Registration)

CREATE VIEW Student_Course_View AS
SELECT
    ca.student_id,
    co.course_offering_id,
    c.course_id,
    c.course_name,
    co.semester,
    f.faculty_id,
    f.faculty_name
FROM Course_Alloted ca
JOIN Course_Offerings co
    ON ca.course_offering_id = co.course_offering_id
JOIN Courses c
    ON co.course_id = c.course_id
JOIN Faculty f
    ON co.faculty_id = f.faculty_id;


--Student_Attendance

CREATE VIEW Student_Attendance_View AS
SELECT
    a.student_id,
    a.course_offering_id,
    c.course_name,
    a.class_date,
    a.status
FROM Attendance a
JOIN Course_Offerings co
    ON a.course_offering_id = co.course_offering_id
JOIN Courses c
    ON co.course_id = c.course_id;


--All Semester Results

CREATE VIEW Student_All_Semester_Grades AS
SELECT
    g.student_id,
    c.course_name,
    co.semester,
    c.credits,
    g.grade
FROM Grades g
JOIN Course_Offerings co
    ON g.course_offering_id = co.course_offering_id
JOIN Courses c
    ON co.course_id = c.course_id;

--Current Semester Results

CREATE VIEW Current_Semester_Results AS
SELECT *
FROM Student_All_Semester_Grades sag
WHERE sag.semester = (
    SELECT MAX(semester)
    FROM Student_All_Semester_Grades
    WHERE student_id = sag.student_id
);


--Supplementary exam Registrations

CREATE VIEW Student_Supplementary_Exams AS
SELECT
    se.student_id,
    c.course_name,
    se.course_offering_id,
    se.price
FROM Supplementary_exams se
JOIN Course_Offerings co
    ON se.course_offering_id = co.course_offering_id
JOIN Courses c
    ON co.course_id = c.course_id;

--Student feedback

CREATE VIEW Student_Feedback_View AS
SELECT
    f.student_id,
    c.course_name,
    f.course_offering_id,
    f.feedback
FROM Feedback f
JOIN Course_Offerings co
    ON f.course_offering_id = co.course_offering_id
JOIN Courses c
    ON co.course_id = c.course_id;

--Leave Requests

CREATE VIEW Student_Leave_Requests AS
SELECT
    student_id,
    start_date,
    end_date,
    reason,
    status
FROM Leave_Requests;

--Faculty Advisors

CREATE VIEW Student_Faculty_Advisor AS
SELECT
    fa.student_id,
    f.faculty_id,
    f.email,
    f.contact_no
FROM Faculty_Advisor fa
JOIN Faculty f
    ON fa.faculty_id = f.faculty_id;

--Courses taught by faculty

CREATE VIEW Faculty_Courses_Taught AS
SELECT
    f.faculty_id,
    c.course_name,
    co.course_offering_id,
    co.year_offering,
    co.semester
FROM Faculty f
JOIN Course_Offerings co
    ON f.faculty_id = co.faculty_id
JOIN Courses c
    ON co.course_id = c.course_id;

--Students in a course

CREATE VIEW Faculty_Course_Students AS
SELECT
    co.faculty_id,
    ca.student_id,
    co.course_offering_id,
    c.course_name
FROM Course_Alloted ca
JOIN Course_Offerings co
    ON ca.course_offering_id = co.course_offering_id
JOIN Courses c
    ON co.course_id = c.course_id;

--Faculty Leave Approvals

CREATE VIEW Faculty_Leave_Approvals AS
SELECT
    lr.request_id,
    lr.student_id,
    lr.start_date,
    lr.end_date,
    lr.reason,
    lr.status
FROM Leave_Requests lr;

--Students under Advisory

CREATE VIEW Faculty_Advisory_Students AS
SELECT
    fa.faculty_id,
    s.student_id,
    s.college_email,
    s.department_id
FROM Faculty_Advisor fa
JOIN Students s
    ON fa.student_id = s.student_id;

-- Feedback views

CREATE VIEW Student_Feedback_Pending AS
SELECT
    ca.student_id,
    co.course_offering_id,
    c.course_id,
    c.course_name,
    co.semester,
    f.faculty_name
FROM Course_Allotted ca
JOIN Course_Offerings co
    ON ca.course_offering_id = co.course_offering_id
JOIN Courses c
    ON co.course_id = c.course_id
JOIN Faculty f
    ON co.faculty_id = f.faculty_id
WHERE co.semester = (
    SELECT semester 
    FROM Students s 
    WHERE s.student_id = ca.student_id
)
AND NOT EXISTS (
    SELECT 1 FROM Feedback fb
    WHERE fb.student_id = ca.student_id
    AND fb.course_offering_id = co.course_offering_id
);

