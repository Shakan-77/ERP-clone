User(
    user_id
    password
)

Roles(
    role_id
    user_id
)

Students(
    student_id
    contact no.
    college email
    personal email
    residence address
    join_date
    department_id
    discipline_id
)


Faculty(
    faculty_id
    contact no.
    email
    department_id
)

Faculty_Advisor(
    student_id
    faculty_id
)

Leave_Requests(
    student_id
    start_date
    end_date
    reason
    status
)

On_leave(
    student_id
    start_date
    end_date
)

Departments(
    dept_id
    dept_name
    head_dept_id
)

Discipline(
    discipline_id
    fees
)

Courses(
    course_id
    course_name
    department_id
    credits
)

Prerequisites(
    main_course_id
    prereq_course_id
)

Course_Offerings(
    course_offering_id
    faculty_id
    course_id
    semester
    capacity
)

Course_Alloted(
    course_offering_id
    student_id
    attendance
    Mid_sem_Marks
    End_sem_Marks
)

Admin(
    admin_id
)

Grades(
    student_id
    course_offering_id
    grade
)

Feedback(
    student_id
    course_offering_id
    feedbaack
)

Rooms(
    building_name
    room_number
    capacity
)

Fee_Payment(
    student_id
    amount_paid
    total_amount
)

Fee_Remission_Application(
    student_id
    application_id
    status
)

Supplementary_exams(
    student_id
    course_offering_id
    price
)

Backlogs(
    student_id
    course_id
)