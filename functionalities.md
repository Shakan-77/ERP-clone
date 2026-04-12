# Abstract

This project presents an ERP-style application that combines two major functional domains within a single repository: an Educational Institute Management System (EIMS) and a banking services module. The objective of the project is to digitize routine institutional and financial operations through an integrated web-based platform that improves accuracy, transparency, speed, and accessibility. Instead of relying on fragmented manual processes, the system centralizes user authentication, data management, workflow handling, and transaction processing through a structured frontend, backend, and database-driven architecture.

The EIMS module is designed to support the core activities of an academic institution. It includes student and faculty login, student profile management, course registration, prerequisite validation, attendance tracking, feedback submission, leave request handling, fee payment management, supplementary examinations, result publication, backlog monitoring and timetable-related operations. The banking module complements this by providing essential digital banking services such as user registration, login, balance enquiry, money transfer, transaction history, and payment processing. Together, these modules demonstrate how enterprise applications can manage both academic administration and financial workflows in a reliable and scalable manner.

From a technical perspective, the system is implemented using a React-based frontend for interactive user interfaces, an Express.js backend for API and business logic handling, and a PostgreSQL database for persistent storage. The database layer is strengthened through schema design, constraints, views, stored procedures, triggers, and scheduled cleanup operations, allowing the application to enforce business rules directly at the data level. The project therefore serves as a practical example of full-stack ERP development with emphasis on modularity, workflow automation, and real-world institutional use cases.

# Project Overview

The ERP Clone project is a full-stack application developed to manage different operational areas that are commonly handled by separate systems. Its main purpose is to provide a unified platform where users can perform academic and banking-related tasks through role-based access and structured workflows. The project is organized into dedicated frontend, backend, and database components for each domain, which makes the codebase easier to understand, maintain, and extend.

The Educational Institute Management System forms the larger administrative core of the project. It supports students, faculty, and administrators in handling academic records and institutional processes. Students can maintain their profiles, register for courses, request leave, pay fees, view results, track backlogs, and participate in feedback-related processes. Faculty members can manage attendance, grades, and approvals, while administrative logic is supported by database constraints, validation procedures, and automated cleanup jobs. This makes the module suitable for modelling real academic workflows with controlled data consistency.

The banking module demonstrates a parallel set of transaction-oriented functionalities within the same ERP environment. It enables secure user onboarding, account access, balance checking, transfer operations, payment confirmation, and transaction tracking. By including both institutional management and banking operations, the project showcases the broader ERP concept of integrating multiple business functions within one coherent system.

Overall, the project emphasizes process automation, centralized data handling, and usability. The frontend provides accessible interfaces for different operations, the backend exposes the required services and validation logic, and the PostgreSQL layer ensures integrity through relational design and procedural support. As a result, the system is not only a functional software implementation but also a representative academic project for demonstrating database-centric application development, enterprise workflow design, and end-to-end full-stack integration.

# Database Schema Details

The project database is divided into two major parts: the EIMS schema for academic and institutional management, and the banking schema for customer accounts and financial transactions. The schema design follows a relational model in which entities are stored in normalized tables and linked through primary keys, foreign keys, and check constraints. This structure helps maintain consistency, prevents invalid data entry, and supports workflow automation in both domains.

## EIMS Tables

The Educational Institute Management System contains tables for user management, academic organization, course operations, student services, examinations, fee processing, and placement activities. The main tables and their purposes are as follows.

1. Users: Stores login credentials and system role for each user. The primary key is user_id. A check constraint ensures that the role can only be Admin, Faculty, or Student.

2. Departments: Stores department details such as department name and head of department. The primary key is dept_id. The head_dept_id column is a foreign key referencing Faculty.

3. Discipline: Stores academic program categories such as B.Tech, M.Tech, and related fee and semester information. The primary key is discipline_id.

4. Students: Stores student profile data including name, contact details, semester, department, and discipline. The primary key is student_id. Foreign keys connect student_id to Users, department_id to Departments, and discipline_id to Discipline.

5. Faculty: Stores faculty profile information such as name, email, phone number, and department. The primary key is faculty_id. Foreign keys connect faculty_id to Users and department_id to Departments.

6. Faculty_Advisor: Maps each student to a faculty advisor. The student_id acts as the primary key, and both student_id and faculty_id are foreign keys referencing Students and Faculty respectively.

7. Courses: Stores course master data such as course name, department, and credits. The primary key is course_id. A foreign key connects department_id to Departments, and a check constraint ensures credits are greater than zero.

8. Prerequisites: Stores prerequisite relationships between courses. It uses a composite primary structure through main_course_id and prereq_course_id, both of which are foreign keys referencing Courses.

9. Course_Offerings: Represents a course offered in a specific semester and year under a faculty member. The primary key is course_offering_id. Important columns include faculty_id, course_id, year_offering, semester, discipline_id, and capacity. Foreign keys reference Faculty, Courses, and Discipline, while a check constraint ensures capacity is positive.

10. Course_Allotted: Stores student enrollment in particular course offerings along with internal marks. It uses a composite key of student_id and course_offering_id. Both columns are foreign keys to Students and Course_Offerings.

11. Attendance: Stores attendance records for each student in each course offering on a given date. It uses a composite primary key consisting of student_id, course_offering_id, and class_date. A check constraint restricts status values to Present, Absent, or On_Leave.

12. Grades: Stores final grades obtained by students in course offerings. It uses a composite primary key of student_id and course_offering_id. A check constraint restricts grades to valid letter values such as Ex, A, B, C, D, E, P, and F.

13. Feedback: Stores course feedback submitted by students. The composite primary key is student_id and course_offering_id. Both columns are foreign keys to Students and Course_Offerings.

14. Rooms: Stores classroom information including building name, room number, and capacity. It uses a composite primary key of building_name and room_number. A check constraint ensures the capacity is positive.

15. Scheduled_class: Stores the regular class schedule for course offerings. Its composite primary key includes course_offering_id, scheduled_day, and start_time. Foreign keys link course_offering_id to Course_Offerings and the pair of building_name and room_number to Rooms. A check constraint restricts scheduled_day to working days.

16. Leave_Requests: Stores student leave applications with request period, reason, status, and application timestamp. The primary key is request_id. The student_id column is a foreign key to Students. A check constraint restricts status to Pending, Approved, or Rejected.

17. On_leave: Stores approved leave records for students. The primary key is request_id. Foreign keys connect student_id to Students and request_id to Leave_Requests.

18. Fee_Payment: Stores each student fee payment transaction. The primary key is payment_id. Important columns include student_id, semester, amount_paid, and payment_date. A check constraint ensures amount_paid is not negative.

19. Fee_Remission_Application: Stores student applications for fee remission. The primary key is application_id. The student_id column references Students, and a check constraint restricts status to Pending, Approved, or Rejected.

20. Supplementary_exams: Stores supplementary exam registrations. It uses a composite primary key of student_id and course_offering_id. Both columns are foreign keys, and a check constraint ensures the price is not negative.

21. Backlogs: Stores details of courses that a student must clear later. It uses a composite primary key of student_id and course_id. Foreign keys reference Students and Courses.

22. Exams: Stores examination records for course offerings, including exam date and room information. The primary key is exam_id. The course_offering_id column is a foreign key to Course_Offerings.

23. Exam_Seating: Stores seating assignments of students for examinations. It uses a composite primary key of exam_id and student_id. Foreign keys reference Exams and Students.

24. Balance: Stores the remaining fee balance for a student. The primary key is student_id, which is also a foreign key to Students. A check constraint ensures remaining_balance is not negative.

25. Course_Registration: Stores temporary and approved course registration entries. It uses a composite primary key of student_id, course_offering_id, and semester. Important columns include selected and approved. Foreign keys link student_id to Students and course_offering_id to Course_Offerings. A logical check constraint ensures that approval cannot exist without prior selection.

26. System_Config: Stores system-wide configuration values such as registration opening date, closing date, result declaration date, and fee portal status. The primary key is config_id. A check constraint enforces a single-row configuration design by allowing only config_id equal to 1.

27. Results: Stores summary academic results for each student, including CGPA and total credits. The primary key is student_id, which also references Students. A check constraint ensures CGPA remains between 0 and 10.

28. CDC: Stores career development and placement opportunities such as company name, application links, job type, and cutoff criteria. The primary key is cdc_id. A check constraint restricts job_type to Intern or Placement.

29. CDC_Eligible_Departments: Stores department-wise eligibility for each CDC opportunity. It uses a composite primary key of cdc_id and department_id. Both columns are foreign keys.

30. CDC_Applications: Stores student applications for CDC opportunities along with resume link, online test status, interview status, final status, and offer details. It uses a composite primary key of student_id and cdc_id. Foreign keys reference Students and CDC, while check constraints restrict the status fields to valid workflow values.

31. booked_class: Stores alternative or booked classroom schedules for course offerings. The primary key is booking_id. Important columns include course_offering_id, building_name, room_number, scheduled_day, start_time, end_time, and faculty_id. A check constraint ensures that start_time is always earlier than end_time.

## Important EIMS Constraints

The EIMS schema uses primary key, foreign key, and check constraints across the tables to maintain correctness of academic and administrative data. The constraints implemented in the SQL files are listed below.

1. Users:
   Primary key on user_id. Check constraint chk_user_role enforces role IN ('Admin','Faculty','Student').

2. Departments:
   Primary key on dept_id. Foreign key fk_department_head enforces head_dept_id REFERENCES Faculty(faculty_id).

3. Discipline:
   Primary key on discipline_id.

4. Students:
   Primary key on student_id. Foreign key fk_student_user enforces student_id REFERENCES Users(user_id). Foreign key fk_student_department enforces department_id REFERENCES Departments(dept_id). Foreign key fk_student_discipline enforces discipline_id REFERENCES Discipline(discipline_id).

5. Faculty:
   Primary key on faculty_id. Foreign key fk_faculty_user enforces faculty_id REFERENCES Users(user_id). Foreign key fk_faculty_department enforces department_id REFERENCES Departments(dept_id).

6. Faculty_Advisor:
   Primary key on student_id. Foreign key fk_advisor_student enforces student_id REFERENCES Students(student_id). Foreign key fk_advisor_faculty enforces faculty_id REFERENCES Faculty(faculty_id).

7. Courses:
   Primary key on course_id. Foreign key fk_course_department enforces department_id REFERENCES Departments(dept_id). Check constraint on credits enforces credits > 0.

8. Prerequisites:
   Composite primary key on main_course_id and prereq_course_id. Foreign key fk_prereq_main enforces main_course_id REFERENCES Courses(course_id). Foreign key fk_prereq_course enforces prereq_course_id REFERENCES Courses(course_id).

9. Course_Offerings:
   Primary key on course_offering_id. Foreign key fk_offering_faculty enforces faculty_id REFERENCES Faculty(faculty_id). Foreign key fk_offering_course enforces course_id REFERENCES Courses(course_id). Foreign key fk_offering_discipline enforces discipline_id REFERENCES Discipline(discipline_id). Check constraint on capacity enforces capacity > 0.

10. Course_Allotted:
	Composite primary key on student_id and course_offering_id. Foreign key fk_allotted_student enforces student_id REFERENCES Students(student_id). Foreign key fk_allotted_course enforces course_offering_id REFERENCES Course_Offerings(course_offering_id).

11. Attendance:
	Composite primary key on student_id, course_offering_id, and class_date. Foreign key fk_attendance_student enforces student_id REFERENCES Students(student_id). Foreign key fk_attendance_offering enforces course_offering_id REFERENCES Course_Offerings(course_offering_id). Check constraint on status enforces status IN ('Present', 'Absent', 'On_Leave').

12. Grades:
	Composite primary key on student_id and course_offering_id. Foreign key fk_grades_student enforces student_id REFERENCES Students(student_id). Foreign key fk_grades_offering enforces course_offering_id REFERENCES Course_Offerings(course_offering_id). Check constraint on grade enforces grade IN ('Ex','A','B','C','D','E','P','F').

13. Feedback:
	Composite primary key on student_id and course_offering_id. Foreign key fk_feedback_student enforces student_id REFERENCES Students(student_id). Foreign key fk_feedback_offering enforces course_offering_id REFERENCES Course_Offerings(course_offering_id).

14. Rooms:
	Composite primary key on building_name and room_number. Check constraint on capacity enforces capacity > 0.

15. Scheduled_class:
	Composite primary key on course_offering_id, scheduled_day, and start_time. Foreign key fk_schedule_offering enforces course_offering_id REFERENCES Course_Offerings(course_offering_id). Foreign key fk_schedule_room enforces (building_name, room_number) REFERENCES Rooms(building_name, room_number). Check constraint on scheduled_day enforces scheduled_day IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday').

16. Leave_Requests:
	Primary key on request_id. Foreign key fk_leave_student enforces student_id REFERENCES Students(student_id). Check constraint on status enforces status IN ('Pending','Approved','Rejected').

17. On_leave:
	Primary key on request_id. Foreign key fk_onleave_student enforces student_id REFERENCES Students(student_id). Foreign key fk_onleave_request enforces request_id REFERENCES Leave_Requests(request_id).

18. Fee_Payment:
	Primary key on payment_id. Foreign key fk_fee_payment_student enforces student_id REFERENCES Students(student_id). Check constraint on amount_paid enforces amount_paid >= 0.

19. Fee_Remission_Application:
	Primary key on application_id. Foreign key fk_fee_remission_student enforces student_id REFERENCES Students(student_id). Check constraint on status enforces status IN ('Pending', 'Approved', 'Rejected').

20. Supplementary_exams:
	Composite primary key on student_id and course_offering_id. Foreign key fk_supp_student enforces student_id REFERENCES Students(student_id). Foreign key fk_supp_offering enforces course_offering_id REFERENCES Course_Offerings(course_offering_id). Check constraint on price enforces price >= 0.

21. Backlogs:
	Composite primary key on student_id and course_id. Foreign key fk_backlog_student enforces student_id REFERENCES Students(student_id). Foreign key fk_backlog_course enforces course_id REFERENCES Courses(course_id).

22. Exams:
	Primary key on exam_id. Foreign key fk_exam_offering enforces course_offering_id REFERENCES Course_Offerings(course_offering_id).

23. Exam_Seating:
	Composite primary key on exam_id and student_id. Foreign key fk_exam_seating_exam enforces exam_id REFERENCES Exams(exam_id). Foreign key fk_exam_seating_student enforces student_id REFERENCES Students(student_id).

24. Balance:
	Primary key on student_id. Foreign key fk_student_balance enforces student_id REFERENCES Students(student_id). Check constraint on remaining_balance enforces remaining_balance >= 0.

25. Course_Registration:
	Composite primary key on student_id, course_offering_id, and semester. Foreign key fk_registration_student enforces student_id REFERENCES Students(student_id) ON DELETE CASCADE. Foreign key fk_registration_course enforces course_offering_id REFERENCES Course_Offerings(course_offering_id) ON DELETE CASCADE. Check constraint chk_selected_before_approval enforces approved = FALSE OR selected = TRUE.

26. System_Config:
	Primary key on config_id. Check constraint on config_id enforces config_id = 1, which ensures that only a single configuration row is maintained.

27. Results:
	Primary key on student_id. Foreign key fk_results_student enforces student_id REFERENCES Students(student_id). Check constraint on cgpa enforces cgpa BETWEEN 0 AND 10. Check constraint on total_credits enforces total_credits >= 0.

28. CDC:
	Primary key on cdc_id. Check constraint on job_type enforces job_type IN ('Intern','Placement').

29. CDC_Eligible_Departments:
	Composite primary key on cdc_id and department_id. Foreign key fk_cdc_dept_cdc enforces cdc_id REFERENCES CDC(cdc_id). Foreign key fk_cdc_dept_department enforces department_id REFERENCES Departments(dept_id).

30. CDC_Applications:
	Composite primary key on student_id and cdc_id. Foreign key fk_cdc_app_student enforces student_id REFERENCES Students(student_id). Foreign key fk_cdc_app_cdc enforces cdc_id REFERENCES CDC(cdc_id). Check constraint on ot_status enforces ot_status IN ('Pending','Qualified','Rejected'). Check constraint on interview_status enforces interview_status IN ('Pending','Qualified','Rejected'). Check constraint on final_status enforces final_status IN ('Selected','Rejected','Pending').

31. booked_class:
	Primary key on booking_id. Foreign key on course_offering_id enforces REFERENCES Course_Offerings(course_offering_id). Check constraint enforces start_time < end_time.

## Banking Tables

The banking module contains a smaller but highly structured schema focused on customer onboarding, account maintenance, transaction processing, and transfer management.

1. Customers: Stores customer profile and login details. The primary key is customer_id. The email field is unique, and important columns include name, email, phone, password, and created_at.
2. Accounts: Stores account information for each customer. The primary key is customer_id, while account_id is also defined as a unique identifier. Important columns include balance, account_type, status, and created_at. A foreign key links customer_id to Customers.
3. Transactions: Stores individual account-level debit and credit entries. The primary key is transaction_id. Important columns include account_id, transaction_type, amount, created_at, and status. The account_id column references Accounts.
4. Transfers: Stores fund transfer records between accounts. The primary key is transfer_id. Important columns include from_account, to_account, amount, status, and created_at. Both account reference columns are foreign keys to Accounts.

## Important Banking Constraints

The banking schema also uses primary key, unique, foreign key, and check constraints to maintain correctness of financial data. The implemented constraints are as follows.

1. Customers:
	Primary key on customer_id. Unique constraint on email ensures that no two customers can register with the same email address.

2. Accounts:
	Primary key on customer_id. Unique constraint on account_id. Foreign key fk_accounts_customer enforces customer_id REFERENCES Customers(customer_id) ON DELETE CASCADE. Check constraint chk_balance_non_negative enforces balance >= 0. Check constraint chk_account_type enforces account_type IN ('savings', 'current'). Check constraint chk_account_status enforces status IN ('active', 'inactive', 'closed').

3. Transactions:
	Primary key on transaction_id. Foreign key fk_transactions_account enforces account_id REFERENCES Accounts(account_id) ON DELETE CASCADE. Check constraint chk_transaction_type enforces transaction_type IN ('credit', 'debit'). Check constraint chk_transaction_amount enforces amount > 0.

4. Transfers:
	Primary key on transfer_id. Foreign key fk_transfers_from enforces from_account REFERENCES Accounts(account_id) ON DELETE CASCADE. Foreign key fk_transfers_to enforces to_account REFERENCES Accounts(account_id) ON DELETE CASCADE. Check constraint chk_transfer_amount enforces amount > 0. Check constraint chk_transfer_accounts_different enforces from_account <> to_account. Check constraint chk_transfer_status enforces status IN ('pending', 'completed', 'failed').

## Schema Summary

Overall, the database design reflects the major goals of the project: structured data organization, enforcement of domain-specific rules, and support for complex workflows. The EIMS schema handles academic administration with a large number of interrelated tables, while the banking schema focuses on transactional integrity and secure account operations. Together, these schemas form the foundation on which the frontend and backend modules of the ERP project operate.

# Implemented Functionalities from Backend and Database Logic

The practical functionality of the project is implemented through Express.js backend routes, SQL views, database triggers, and stored procedures. While the frontend provides the user interface, the backend and database logic together define the actual behavior of the system. The following sections summarize the major implemented functionalities visible in the backend files and SQL logic files.

## EIMS Backend Functionalities

The EIMS backend provides API endpoints for authentication, academic operations, student services, faculty operations, and administrative processing.

1. Authentication and user management:
	User signup is implemented with password-strength validation. Login is supported with password verification and migration support for legacy plain-text passwords. The backend also provides a route to list system users and roles.

2. Student profile management:
	Students can update their profile information and retrieve their saved profile details from the backend.

3. Course registration workflow:
	Students can view available course registrations, select or deselect offered courses, and view enrolled courses. Faculty can view pending approvals, inspect a particular student's pending course selections, and approve course registrations.

4. Fee management:
	Students can view semester-wise fee status, initiate fee payment, record successful payment, view payment history, apply for fee remission, and check fee-remission status.

5. Grades and result processing:
	Faculty can upload grades in bulk. Students can view their results, full grade history, current semester courses and grades, semester transcript, current SGPA, previous SGPA, and overall CGPA.

6. Attendance and timetable management:
	Faculty can fetch students in a course and mark attendance. Students can view attendance summaries and timetable details through backend routes.

7. Feedback management:
	Students can view feedback-eligible courses, submit feedback, and review already submitted feedback. Faculty can view feedback for their course offerings.

8. Leave management:
	Students can apply for leave and view their leave requests. Faculty can view pending leave approvals and perform approve or reject actions.

9. Examination and supplementary exam support:
	Students can view exam schedules and supplementary exam eligibility through dedicated backend routes.

10. Faculty operations:
	 Faculty can view courses taught, current semester courses, enrolled students for a course, advisory students, leave-approval queues, and their own teaching schedule.

11. Classroom scheduling and booking:
	 Faculty can view available room slots, list buildings, book extra classes, book rooms, and view their own room bookings and class schedule.

12. Advisor information:
	 Students can retrieve faculty advisor details from the backend.

## EIMS Database Views

The EIMS views are designed to simplify complex queries and present user-specific academic data in a structured manner.

1. Student_Registration_View shows course-registration options along with approval status.
2. Student_Course_View shows the final enrolled courses of a student after approval.
3. Student_Attendance_View shows attendance entries course-wise.
4. Student_All_Semester_Grades stores or exposes complete semester-wise grade history.
5. Student_SGPA computes semester GPA using grade-point mapping.
6. current_sem_sgpa provides the GPA of the current semester.
7. Student_Current_Sem_Courses_Grades shows current semester courses, marks, and grades.
8. Student_Previous_SGPA shows the GPA values of previous semesters.
9. Student_Fee_Status shows the total fee, paid amount, and remaining balance.
10. Student_Payment_History shows payment transactions in descending date order.
11. Student_Supplementary_Exams lists failed subjects eligible for supplementary examination.
12. Student_Feedback_View shows feedback submitted by a student.
13. Student_Leave_Requests shows leave history and request status.
14. Student_Faculty_Advisor shows the assigned advisor details for each student.
15. Student_Exam_View shows exam schedule, room, building, and seating-related details.
16. Student_Attendance_Summary aggregates present and absent counts course-wise.
17. Student_Timetable_View combines regular classes and booked extra classes into one timetable.
18. Eligible_CDC_For_Student shows placement opportunities filtered by CGPA and department eligibility.
19. Faculty_Courses_Taught shows courses assigned to a faculty member along with capacity-related details.
20. Faculty_Course_Students shows course-wise student rosters.
21. Faculty_Leave_Approvals shows leave requests that need faculty action.
22. Faculty_Advisory_Students shows students assigned to a faculty advisor.
23. view_faculty_feedback_comments shows feedback comments received on a faculty member's courses.

## EIMS Triggers

The EIMS triggers automate validation, derived data updates, and workflow transitions inside the database.

1. trg_update_semester automatically updates the semester of a student based on join date or time progression.
2. trg_check_prerequisites validates whether a student satisfies prerequisite conditions before registration.
3. trg_course_capacity prevents registration or allotment beyond course capacity.
4. trg_course_approval moves approved registration records into Course_Allotted and removes them from temporary workflow tables when required.
5. trg_check_fee_payment validates that payment does not exceed the remaining fee balance.
6. trg_update_balance automatically reduces the student balance after a valid fee payment.
7. trg_create_backlog automatically inserts a backlog record when a student receives grade F.
8. trg_remove_backlog removes an existing backlog once the student clears the course.
9. trg_handle_supplementary adds failed courses to supplementary examination tracking and removes them when the student later passes.
10. trg_clear_supplementary clears supplementary records when the registration window reopens or when reset logic is triggered.
11. trg_leave_approved automatically inserts a record into On_leave when a leave request is approved.
12. trg_room_capacity prevents exam seating allocation beyond room capacity.
13. trg_generate_exam_seating automatically generates seating assignments when an exam is created.
14. trg_set_balance_from_discipline updates fee balance values when discipline fee definitions are changed.

In addition to database triggers, the backend also runs scheduled cleanup jobs that remove expired bookings, old leave records, past exams, and periodically clear feedback and scheduled classes at semester boundaries.

## EIMS Stored Procedures and Functions

Stored procedures and functions are used to centralize reusable business logic inside the database.

1. bulk_register_students() automatically registers eligible students into courses, including backlog-related logic.
2. trg_registration_open() triggers bulk registration logic when the course-registration window opens.
3. update_cgpa_all_students() recalculates CGPA and total academic progress for all students after grading-related updates.
4. mark_attendance(course_id, date, present_students[]) records attendance and automatically marks valid absences or approved leave cases.
5. apply_leave(student_id, start_date, end_date, reason) inserts a leave request with date validation.
6. upload_grade(student_id, course_id, grade) inserts or updates a grade with value validation.
7. submit_feedback(student_id, course_id, feedback) saves course feedback after checking that the content is valid.
8. make_payment(student_id, semester, amount) records fee payment only when the fee-payment window is open.
9. add_scheduled_class(course_id, start_time, end_time, day, building, room) inserts scheduled classes after checking for room and timetable conflicts.
10. get_room_availability(day) returns available room slots for booking and scheduling operations.
11. add_exam(course_id, room, building, date) inserts an exam schedule after validating the exam date.
12. apply_fee_remission(student_id) stores a fee-remission request while preventing invalid duplicate applications.
13. insert_bookings(bookings_json) bulk-inserts extra class or room bookings with conflict checking.

## Banking Backend Functionalities

The banking backend supports customer onboarding, authentication, account creation, money movement, balance enquiry, fee-payment integration, and account history retrieval.

1. Customer signup is implemented with password-strength validation.
2. Customer login supports authentication using email or username-based credentials.
3. Account creation is supported through a create-account flow that validates PIN or account setup conditions and can create a customer if needed.
4. Balance enquiry is available by account ID and also through customer identifier lookup.
5. Deposit functionality is implemented to add money into an account.
6. Withdrawal functionality is implemented with insufficient-balance validation.
7. Fund transfer functionality moves money between accounts, validates balance and account identity, and records the transfer.
8. Transaction and transfer history can be retrieved for an account.
9. The banking backend also supports fee-payment flow integration with the EIMS system by redirecting users into the payment process and notifying the EIMS backend after successful transfer or payment.

## Banking Stored Procedures

The banking module uses stored procedures to enforce transactional behavior in core financial operations.

1. create_customer() inserts a new customer record into the banking database.
2. deposit_amount() increases account balance, validates amount, records a credit transaction, and returns operation status.
3. withdraw_amount() reduces account balance when sufficient funds exist, records the transaction result, and handles insufficient-balance cases.
4. transfer_amount() transfers money between two accounts atomically, validates positive amount, prevents self-transfer, updates balances, records transfer status, and returns a success or failure message.

## Banking Triggers

The banking module also contains trigger-based automation.

1. trg_create_account automatically creates a default savings account with active status whenever a new customer record is inserted into the Customers table.

## Functional Summary

The backend, views, triggers, and procedures together show that the project is not limited to basic CRUD operations. Instead, it implements end-to-end workflows for registration, grading, attendance, payments, leave approval, room scheduling, banking transactions, and academic result processing. This layered implementation demonstrates how application-level services and database-level automation can work together to build a complete ERP-style system.

# Normalization and BCNF Analysis

The normalization analysis is performed on the base tables of the EIMS and banking schemas. Database views are not included in this part because they are derived relations and do not store independent base data. For each table, the relevant non-trivial functional dependencies are identified from the declared keys, unique constraints, and intended meaning of the relation. A table is in Boyce-Codd Normal Form (BCNF) if, for every non-trivial functional dependency $X \to Y$, the determinant $X$ is a superkey.

## Functional Dependencies in EIMS Tables

1. Users:
   user_id -> password, role

2. Departments:
   dept_id -> dept_name, head_dept_id

3. Discipline:
   discipline_id -> max_semester, fees

4. Students:
   student_id -> student_name, contact_no, college_email, personal_email, residence_address, join_date, semester, department_id, discipline_id

5. Faculty:
   faculty_id -> faculty_name, contact_no, email, department_id

6. Faculty_Advisor:
   student_id -> faculty_id

7. Courses:
   course_id -> course_name, department_id, credits

8. Prerequisites:
   (main_course_id, prereq_course_id) is the only determinant. There are no non-key attributes, so there is no non-trivial dependency with a non-superkey determinant.

9. Course_Offerings:
   course_offering_id -> faculty_id, course_id, year_offering, semester, discipline_id, capacity

10. Course_Allotted:
	(student_id, course_offering_id) -> mid_sem_marks, end_sem_marks

11. Attendance:
	(student_id, course_offering_id, class_date) -> status

12. Grades:
	(student_id, course_offering_id) -> grade

13. Feedback:
	(student_id, course_offering_id) -> feedback

14. Rooms:
	(building_name, room_number) -> capacity

15. Scheduled_class:
	(course_offering_id, scheduled_day, start_time) -> end_time, building_name, room_number

16. Leave_Requests:
	request_id -> student_id, start_date, end_date, reason, applied_on, status

17. On_leave:
	request_id -> student_id, start_date, end_date

18. Fee_Payment:
	payment_id -> student_id, semester, amount_paid, payment_date

19. Fee_Remission_Application:
	application_id -> student_id, status

20. Supplementary_exams:
	(student_id, course_offering_id) -> price

21. Backlogs:
	(student_id, course_id) is the only determinant. There are no non-key attributes, so there is no non-trivial dependency with a non-superkey determinant.

22. Exams:
	exam_id -> course_offering_id, room_number, building_name, date_of_exam

23. Exam_Seating:
	(exam_id, student_id) is the only determinant. There are no non-key attributes, so there is no non-trivial dependency with a non-superkey determinant.

24. Balance:
	student_id -> remaining_balance

25. Course_Registration:
	(student_id, course_offering_id, semester) -> selected, approved

26. System_Config:
	config_id -> registration_open_date, registration_close_date, results_declaration_date, is_fees_open

27. Results:
	student_id -> cgpa, total_credits

28. CDC:
	cdc_id -> company_name, apply_link, job_type, cgpa_cutoff, ot_link, interview_link

29. CDC_Eligible_Departments:
	(cdc_id, department_id) is the only determinant. There are no non-key attributes, so there is no non-trivial dependency with a non-superkey determinant.

30. CDC_Applications:
	(student_id, cdc_id) -> resume_link, ot_status, interview_status, final_status, offer_details

31. booked_class:
	booking_id -> course_offering_id, building_name, room_number, scheduled_day, start_time, end_time, faculty_id

## Functional Dependencies in Banking Tables

1. Customers:
   customer_id -> name, email, phone, password, created_at
   email -> customer_id, name, phone, password, created_at

2. Accounts:
   customer_id -> account_id, balance, account_type, status, created_at
   account_id -> customer_id, balance, account_type, status, created_at

3. Transactions:
   transaction_id -> account_id, transaction_type, amount, created_at, status

4. Transfers:
   transfer_id -> from_account, to_account, amount, status, created_at

## BCNF Verification

The above relations are in BCNF for the following reasons.

1. Tables with a single primary key and no alternate determinant outside a candidate key are in BCNF because their only non-trivial dependencies are of the form primary_key -> non_key_attributes. This applies to Users, Departments, Discipline, Students, Faculty, Course_Offerings, Leave_Requests, On_leave, Fee_Payment, Fee_Remission_Application, Exams, Balance, System_Config, Results, CDC, booked_class, Transactions, and Transfers.

2. Tables with composite primary keys and descriptive attributes are in BCNF because the full composite key is the only determinant of the non-key attributes. This applies to Course_Allotted, Attendance, Grades, Feedback, Rooms, Scheduled_class, Supplementary_exams, Course_Registration, and CDC_Applications.

3. Pure relationship tables containing only key attributes are trivially in BCNF because they contain no non-key attributes that can create partial or transitive dependency problems. This applies to Prerequisites, Backlogs, Exam_Seating, and CDC_Eligible_Departments.

4. Faculty_Advisor is in BCNF because student_id is the declared primary key and the only determinant of faculty_id in the stored relation. The schema models one advisor per student, so student_id is the candidate key for the table.

5. Customers is in BCNF because both customer_id and email function as candidate keys. Every non-trivial dependency in the table has a determinant that is a candidate key.

6. Accounts is in BCNF because customer_id is the primary key and account_id is declared unique, making both determinants candidate keys under the intended schema semantics. Therefore, every non-trivial dependency has a superkey on the left-hand side.

## Conclusion of Normalization

The schema design separates independent entities, eliminates repeating groups, avoids partial dependencies on subsets of composite keys, and prevents transitive storage of unrelated attributes inside the same table. Based on the declared keys, unique constraints, and table semantics, all base tables in the EIMS and banking modules satisfy the condition for Boyce-Codd Normal Form. This means the database design is highly normalized and reduces redundancy, update anomalies, insertion anomalies, and deletion anomalies.


