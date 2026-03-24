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
FROM Course_Allotted ca
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

CREATE OR REPLACE VIEW Current_Semester_Results AS
SELECT 
    sag.*,
    r.cgpa,

    -- SGPA calculation
    (
        SUM(
            c.credits *
            CASE g.grade
                WHEN 'Ex' THEN 10
                WHEN 'A' THEN 9
                WHEN 'B' THEN 8
                WHEN 'C' THEN 7
                WHEN 'D' THEN 6
                WHEN 'E' THEN 5
                WHEN 'P' THEN 4
                ELSE 0
            END
        )
        /
        NULLIF(
            SUM(
                CASE 
                    WHEN g.grade <> 'F' THEN c.credits
                    ELSE 0
                END
            ), 0
        )
    ) AS sgpa

FROM Student_All_Semester_Grades sag

JOIN Results r
    ON sag.student_id = r.student_id

JOIN Grades g
    ON sag.student_id = g.student_id
    AND sag.course_offering_id = g.course_offering_id

JOIN Course_Offerings co
    ON g.course_offering_id = co.course_offering_id
    AND co.semester = sag.semester

JOIN Courses c
    ON co.course_id = c.course_id

WHERE sag.semester = (
    SELECT MAX(sag2.semester)
    FROM Student_All_Semester_Grades sag2
    WHERE sag2.student_id = sag.student_id
)

GROUP BY 
    sag.student_id,
    sag.course_offering_id,
    sag.semester,
    r.cgpa;

--Fee Details

CREATE OR REPLACE VIEW Student_Fee_Status AS
SELECT 
    s.student_id,
    s.college_email,
    d.discipline_id,
    d.fees AS total_program_fee,
    (d.fees - b.remaining_balance) AS amount_paid, 
    b.remaining_balance
FROM Students s
JOIN Discipline d ON s.discipline_id = d.discipline_id
JOIN Balance b ON s.student_id = b.student_id;

--Fee payment history

CREATE OR REPLACE VIEW Student_Payment_History AS
SELECT 
    fp.payment_id,
    fp.student_id,
    s.college_email,
    fp.semester,
    fp.amount_paid,
    fp.payment_date,
    d.discipline_id,
    b.remaining_balance
FROM Fee_Payment fp
JOIN Students s ON fp.student_id = s.student_id
JOIN Discipline d ON s.discipline_id = d.discipline_id
JOIN Balance b ON s.student_id = b.student_id
ORDER BY fp.payment_date DESC;

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
FROM Course_Allotted ca
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

CREATE OR REPLACE VIEW view_faculty_feedback_comments AS
SELECT 
    co.faculty_id,
    c.course_code,
    c.course_name,
    co.semester,
    co.year_offering,
    fb.feedback -- Using the column name from your image
FROM Feedback fb
JOIN Course_Offerings co ON fb.course_offering_id = co.course_offering_id
JOIN Courses c ON co.course_id = c.course_id;

-- Exam views for a student

CREATE VIEW Student_Exam_View AS
SELECT
    es.student_id,
    c.course_name,
    e.date_of_exam,
    e.building_name,
    e.room_number
FROM Exam_Seating es
JOIN Exams e
    ON es.exam_id = e.exam_id
JOIN Course_Offerings co
    ON e.course_offering_id = co.course_offering_id
JOIN Courses c
    ON co.course_id = c.course_id;

-- Show CDC Opportunities for a student

CREATE VIEW Eligible_CDC_For_Student AS
SELECT 
    s.student_id,
    c.cdc_id,
    c.company_name,
    c.apply_link,
    c.job_type,
    c.cgpa_cutoff
FROM Students s

JOIN Results r 
    ON s.student_id = r.student_id

JOIN CDC c 
    ON r.cgpa >= c.cgpa_cutoff

JOIN CDC_Eligible_Departments ced 
    ON c.cdc_id = ced.cdc_id
    AND ced.department_id = s.department_id;