-- FACULTY

CREATE INDEX idx_faculty_department
ON Faculty(department_id);


-- DEPARTMENTS

CREATE INDEX idx_departments_head
ON Departments(head_dept_id);


-- STUDENTS

CREATE INDEX idx_students_department
ON Students(department_id);

CREATE INDEX idx_students_discipline
ON Students(discipline_id);


-- FACULTY ADVISOR

CREATE INDEX idx_advisor_student
ON Faculty_Advisor(student_id);

CREATE INDEX idx_advisor_faculty
ON Faculty_Advisor(faculty_id);


-- COURSES

CREATE INDEX idx_courses_department
ON Courses(department_id);


-- PREREQUISITES

CREATE INDEX idx_prereq_main_course
ON Prerequisites(main_course_id);

CREATE INDEX idx_prereq_course
ON Prerequisites(prereq_course_id);


-- COURSE OFFERINGS

CREATE INDEX idx_offering_faculty
ON Course_Offerings(faculty_id);

CREATE INDEX idx_offering_course
ON Course_Offerings(course_id);

CREATE INDEX idx_offering_discipline
ON Course_Offerings(discipline_id);


-- COURSE ALLOTTED

CREATE INDEX idx_alloted_student
ON Course_Allotted(student_id);

CREATE INDEX idx_alloted_offering
ON Course_Allotted(course_offering_id);


-- ATTENDANCE

CREATE INDEX idx_attendance_student
ON Attendance(student_id);

CREATE INDEX idx_attendance_offering
ON Attendance(course_offering_id);


-- GRADES

CREATE INDEX idx_grades_student
ON Grades(student_id);

CREATE INDEX idx_grades_offering
ON Grades(course_offering_id);


-- FEEDBACK

CREATE INDEX idx_feedback_student
ON Feedback(student_id);

CREATE INDEX idx_feedback_offering
ON Feedback(course_offering_id);



-- SCHEDULED CLASS

CREATE INDEX idx_schedule_offering
ON Scheduled_class(course_offering_id);

-- composite foreign key
CREATE INDEX idx_schedule_room
ON Scheduled_class(building_name, room_number);



-- LEAVE REQUESTS

CREATE INDEX idx_leave_student
ON Leave_Requests(student_id);


-- ON LEAVE

CREATE INDEX idx_onleave_student
ON On_leave(student_id);

CREATE INDEX idx_onleave_request
ON On_leave(request_id);


-- FEE PAYMENT

CREATE INDEX idx_fee_payment_student
ON Fee_Payment(student_id);


-- FEE REMISSION

CREATE INDEX idx_fee_remission_student
ON Fee_Remission_Application(student_id);


-- SUPPLEMENTARY EXAMS

CREATE INDEX idx_supp_student
ON Supplementary_exams(student_id);

CREATE INDEX idx_supp_offering
ON Supplementary_exams(course_offering_id);



-- BACKLOGS

CREATE INDEX idx_backlog_student
ON Backlogs(student_id);

CREATE INDEX idx_backlog_course
ON Backlogs(course_id);


-- EXAMS

CREATE INDEX idx_exam_offering
ON Exams(course_offering_id);


-- EXAM SEATING

CREATE INDEX idx_exam_seating_exam
ON Exam_Seating(exam_id);

CREATE INDEX idx_exam_seating_student
ON Exam_Seating(student_id);

-- COURSE REGISTRATION

CREATE INDEX idx_registration_student
ON Course_Registration(student_id);

CREATE INDEX idx_registration_course
ON Course_Registration(course_id);

CREATE INDEX idx_registration_approved
ON Course_Registration(approved);

CREATE INDEX idx_registration_student_sem
ON Course_Registration(student_id, semester);