-- Update Attendance status

CREATE OR REPLACE FUNCTION mark_attendance(
    p_student_id INT,
    p_course_offering_id INT,
    p_class_date DATE,
    p_status TEXT
)
RETURNS VOID AS $$
DECLARE
    is_on_leave BOOLEAN;
BEGIN

    SELECT EXISTS (
        SELECT 1
        FROM On_Leave ol
        WHERE ol.student_id = p_student_id
          AND p_class_date BETWEEN ol.start_date AND ol.end_date
    )
    INTO is_on_leave;

    IF is_on_leave THEN
        p_status := 'On_Leave';
    END IF;

    INSERT INTO Attendance(student_id, course_offering_id, class_date, status)
    VALUES (p_student_id, p_course_offering_id, p_class_date, p_status)
    ON CONFLICT (student_id, course_offering_id, class_date)
    DO UPDATE SET status = EXCLUDED.status;

END;
$$ LANGUAGE plpgsql;

-- Update Leave Requests

CREATE OR REPLACE FUNCTION apply_leave(
    p_student_id INT,
    p_start_date DATE,
    p_end_date DATE,
    p_reason TEXT
)
RETURNS VOID AS $$
BEGIN

    IF p_start_date > p_end_date THEN
        RAISE EXCEPTION 'Start date cannot be after end date';
    END IF;

    INSERT INTO Leave_Request(
        student_id,
        start_date,
        end_date,
        reason,
        status
    )
    VALUES (
        p_student_id,
        p_start_date,
        p_end_date,
        p_reason,
        'Pending'
    );

END;
$$ LANGUAGE plpgsql;

--Update grades for a Student

CREATE OR REPLACE FUNCTION upload_grade(
    p_student_id INT,
    p_course_offering_id INT,
    p_grade TEXT
)
RETURNS VOID AS $$
BEGIN

    IF p_grade NOT IN ('Ex','A','B','C','D','E','P','F') THEN
        RAISE EXCEPTION 'Invalid grade';
    END IF;

    INSERT INTO Grades(student_id, course_offering_id, grade)
    VALUES (p_student_id, p_course_offering_id, p_grade)
    ON CONFLICT (student_id, course_offering_id)
    DO UPDATE SET grade = EXCLUDED.grade;

END;
$$ LANGUAGE plpgsql;

--Update feedback for a course

CREATE OR REPLACE FUNCTION submit_feedback(
    p_student_id INT,
    p_course_offering_id INT,
    p_feedback TEXT
)
RETURNS VOID AS $$
BEGIN

    IF p_feedback IS NULL OR LENGTH(TRIM(p_feedback)) = 0 THEN
        RAISE EXCEPTION 'Feedback cannot be empty';
    END IF;

    INSERT INTO Feedback(student_id, course_offering_id, feedback)
    VALUES (p_student_id, p_course_offering_id, p_feedback)
    ON CONFLICT (student_id, course_offering_id)
    DO UPDATE SET feedback = EXCLUDED.feedback;

END;
$$ LANGUAGE plpgsql;

-- Insert into Fee Payment

CREATE OR REPLACE FUNCTION make_payment(
    p_student_id INT,
    p_semester INT,
    p_amount NUMERIC
)
RETURNS VOID AS $$
BEGIN

    IF p_amount <= 0 THEN
        RAISE EXCEPTION 'Invalid amount';
    END IF;

    INSERT INTO Fee_Payment(
        payment_id,
        student_id,
        semester,
        amount_paid,
        payment_date
    )
    VALUES (
        nextval('fee_payment_seq'),
        p_student_id,
        p_semester,
        p_amount,
        CURRENT_DATE
    );

END;
$$ LANGUAGE plpgsql;

-- Insert into Exams

CREATE OR REPLACE FUNCTION add_exam(
    p_exam_id INT,
    p_course_offering_id INT,
    p_room_number VARCHAR,
    p_building_name VARCHAR,
    p_date DATE
)
RETURNS VOID AS $$
BEGIN
    IF p_date < CURRENT_DATE THEN
        RAISE EXCEPTION 'Exam date cannot be in the past';
    END IF;

    INSERT INTO Exams(
        exam_id,
        course_offering_id,
        room_number,
        building_name,
        date_of_exam
    )
    VALUES (
        p_exam_id,
        p_course_offering_id,
        p_room_number,
        p_building_name,
        p_date
    );

END;
$$ LANGUAGE plpgsql;

-- Insert into Schedeuled Class

CREATE OR REPLACE FUNCTION add_scheduled_class(
    p_course_offering_id INT,
    p_start_time TIME,
    p_end_time TIME,
    p_day VARCHAR,
    p_building_name TEXT,
    p_room_number INT
)
RETURNS VOID AS $$
DECLARE
    v_faculty_id INT;
BEGIN

    IF p_start_time >= p_end_time THEN
        RAISE EXCEPTION 'Start time must be before end time';
    END IF;

    SELECT faculty_id
    INTO v_faculty_id
    FROM Course_Offerings
    WHERE course_offering_id = p_course_offering_id;

    IF EXISTS (
        SELECT 1 FROM Scheduled_class sc
        WHERE sc.scheduled_day = p_day
          AND sc.building_name = p_building_name
          AND sc.room_number = p_room_number
          AND (
                p_start_time < sc.end_time AND
                p_end_time > sc.start_time
              )
    ) THEN
        RAISE EXCEPTION 'Room already occupied in this time slot';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM Scheduled_class sc
        JOIN Course_Offerings co
            ON sc.course_offering_id = co.course_offering_id
        WHERE co.faculty_id = v_faculty_id
          AND sc.scheduled_day = p_day
          AND (
                p_start_time < sc.end_time AND
                p_end_time > sc.start_time
              )
    ) THEN
        RAISE EXCEPTION 'Faculty has another class in this time slot';
    END IF;

    INSERT INTO Scheduled_class(
        course_offering_id,
        start_time,
        end_time,
        scheduled_day,
        building_name,
        room_number
    )
    VALUES (
        p_course_offering_id,
        p_start_time,
        p_end_time,
        p_day,
        p_building_name,
        p_room_number
    );

END;
$$ LANGUAGE plpgsql;

