-- Update Attendance status
CREATE OR REPLACE PROCEDURE mark_attendance(
    p_offering_id INT,
    p_date DATE,
    p_present_student_ids INT[]
)
LANGUAGE plpgsql
AS $$
BEGIN

    DELETE FROM Attendance 
    WHERE course_offering_id = p_offering_id 
      AND class_date = p_date;

    INSERT INTO Attendance (student_id, course_offering_id, class_date, status)
    SELECT 
        unnest(p_present_student_ids), 
        p_offering_id, 
        p_date, 
        'Present';

    INSERT INTO Attendance (student_id, course_offering_id, class_date, status)
    SELECT 
        ca.student_id, 
        p_offering_id, 
        p_date,
        CASE 
            WHEN ol.student_id IS NOT NULL THEN 'On_Leave'
            ELSE 'Absent'
        END
    FROM Course_Allotted ca
    LEFT JOIN On_leave ol 
        ON ca.student_id = ol.student_id 
        AND p_date BETWEEN ol.start_date AND ol.end_date
    WHERE ca.course_offering_id = p_offering_id
      AND NOT (ca.student_id = ANY(p_present_student_ids));

END;
$$;

-- Update Leave Requests

CREATE SEQUENCE leave_request_seq START 1;

CREATE OR REPLACE FUNCTION apply_leave(
    p_student_id TEXT,
    p_start_date DATE,
    p_end_date DATE,
    p_reason TEXT
)
RETURNS VOID AS $$
BEGIN

    IF p_start_date > p_end_date THEN
        RAISE EXCEPTION 'Start date cannot be after end date';
    END IF;

    INSERT INTO Leave_Requests(
        request_id,
        student_id,
        start_date,
        end_date,
        reason,
        status
    )
    VALUES (
        nextval('leave_request_seq'),
        p_student_id,
        p_start_date,
        p_end_date,
        TRIM(p_reason),
        'Pending'
    );

END;
$$ LANGUAGE plpgsql;

--Update grades for a Student

CREATE OR REPLACE FUNCTION upload_grade(
    p_student_id TEXT,
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
    p_student_id TEXT,
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

CREATE SEQUENCE fee_payment_seq START 1;

CREATE OR REPLACE FUNCTION make_payment(
    p_student_id TEXT,
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

CREATE SEQUENCE exam_seq START 1;

CREATE OR REPLACE FUNCTION add_exam(
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
        nextval('exam_seq'),
        p_course_offering_id,
        p_room_number,
        p_building_name,
        p_date
    );

END;
$$ LANGUAGE plpgsql;


-- Insert into Fee_Remission_Applications

CREATE SEQUENCE fee_remission_application_seq START 1;

CREATE OR REPLACE FUNCTION apply_fee_remission(p_student_id TEXT)
RETURNS VOID AS $$
BEGIN

IF EXISTS (
    SELECT 1 
    FROM Fee_Remission_Application
    WHERE student_id = p_student_id
) THEN
    RAISE EXCEPTION 'You have already applied for fee remission';
END IF;

INSERT INTO Fee_Remission_Application (
    application_id,
    student_id,
    status
)
VALUES (
    nextval('fee_remission_application_seq'),
    p_student_id,
    'Pending'
);

END;
$$ LANGUAGE plpgsql;

-- Insert into Scheduled_class by ADMIN

CREATE OR REPLACE FUNCTION add_scheduled_class(
    p_course_offering_id INT,
    p_start_time TIME,
    p_end_time TIME,
    p_day VARCHAR,
    p_building_name TEXT,
    p_room_number INT
)
RETURNS VOID AS $$
BEGIN

IF p_start_time >= p_end_time THEN
    RAISE EXCEPTION 'Start time must be before end time';
END IF;

IF EXISTS (
    SELECT 1
    FROM Scheduled_class sc
    WHERE sc.building_name = p_building_name
      AND sc.room_number = p_room_number
      AND sc.scheduled_day = p_day
      AND (
            (p_start_time, p_end_time) OVERLAPS (sc.start_time, sc.end_time)
          )
) THEN
    RAISE EXCEPTION 'Room is already occupied at this time';
END IF;

IF EXISTS (
    SELECT 1
    FROM Scheduled_class sc
    WHERE sc.course_offering_id = p_course_offering_id
      AND sc.scheduled_day = p_day
      AND (
            (p_start_time, p_end_time) OVERLAPS (sc.start_time, sc.end_time)
          )
) THEN
    RAISE EXCEPTION 'Course already has a class at this time';
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