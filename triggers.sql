--When Leave_Approval approved, Add to On_Leave

CREATE OR REPLACE FUNCTION add_student_on_leave()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'Approved' AND OLD.status <> 'Approved' THEN
        INSERT INTO On_leave(student_id, request_id)
        VALUES (NEW.student_id, NEW.request_id);
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_leave_approved
AFTER UPDATE ON Leave_Requests
FOR EACH ROW
EXECUTE FUNCTION add_student_on_leave();

-- Prevent Duplicate Attendance

CREATE OR REPLACE FUNCTION prevent_duplicate_attendance()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM Attendance
        WHERE student_id = NEW.student_id
        AND course_offering_id = NEW.course_offering_id
        AND date = NEW.date
    ) THEN
        RAISE EXCEPTION 'Duplicate attendance record';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_prevent_duplicate_attendance
BEFORE INSERT ON Attendance
FOR EACH ROW
EXECUTE FUNCTION prevent_duplicate_attendance();

--Course Capacity Check

CREATE OR REPLACE FUNCTION check_course_capacity()
RETURNS TRIGGER AS $$
DECLARE
    current_count INT;
    max_capacity INT;
BEGIN

    SELECT capacity INTO max_capacity
    FROM Course_Offerings
    WHERE course_offering_id = NEW.course_offering_id;

    SELECT COUNT(*) INTO current_count
    FROM Course_Alloted
    WHERE course_offering_id = NEW.course_offering_id;

    IF current_count >= max_capacity THEN
        RAISE EXCEPTION 'Course capacity reached';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_course_capacity
BEFORE INSERT ON Course_Alloted
FOR EACH ROW
EXECUTE FUNCTION check_course_capacity();

-- Check Prerquistes

CREATE OR REPLACE FUNCTION check_prerequisites()
RETURNS TRIGGER AS $$
BEGIN

IF EXISTS (
    SELECT 1
    FROM Prerequisites p
    WHERE p.main_course_id = (
            SELECT course_id
            FROM Course_Offerings
            WHERE course_offering_id = NEW.course_offering_id
        )

    AND NOT EXISTS (
        SELECT 1
        FROM Grades g
        JOIN Course_Offerings co
        ON g.course_offering_id = co.course_offering_id
        WHERE g.student_id = NEW.student_id
        AND co.course_id = p.prereq_course_id
        AND g.grade <> 'F'
    )
)
THEN
    RAISE EXCEPTION 'Prerequisite course not completed';
END IF;

RETURN NEW;

END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_prerequisites
BEFORE INSERT ON Course_Alloted
FOR EACH ROW
EXECUTE FUNCTION check_prerequisites();

--Auto Create Backlog

CREATE OR REPLACE FUNCTION create_backlog()
RETURNS TRIGGER AS $$
BEGIN

IF NEW.grade = 'F' THEN
    INSERT INTO Backlogs(student_id, course_id)
    VALUES (
        NEW.student_id,
        (SELECT course_id
         FROM Course_Offerings
         WHERE course_offering_id = NEW.course_offering_id)
    );
END IF;

RETURN NEW;

END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_create_backlog
AFTER INSERT ON Grades
FOR EACH ROW
EXECUTE FUNCTION create_backlog();

--Check remaining balance

CREATE OR REPLACE FUNCTION check_fee_payment()
RETURNS TRIGGER AS $$
DECLARE
    current_balance INT;
BEGIN

SELECT remaining_balance
INTO current_balance
FROM Balance
WHERE student_id = NEW.student_id;

IF NEW.amount_paid > current_balance THEN
    RAISE EXCEPTION 'Payment exceeds remaining balance';
END IF;

RETURN NEW;

END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_fee_payment
BEFORE INSERT ON Fee_Payment
FOR EACH ROW
EXECUTE FUNCTION check_fee_payment();

--Update Balance after payment

CREATE OR REPLACE FUNCTION update_balance_after_payment()
RETURNS TRIGGER AS $$
BEGIN

UPDATE Balance
SET remaining_balance = remaining_balance - NEW.amount_paid
WHERE student_id = NEW.student_id;

RETURN NEW;

END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_balance
AFTER INSERT ON Fee_Payment
FOR EACH ROW
EXECUTE FUNCTION update_balance_after_payment();

-- Delete exam after exam_date

CREATE OR REPLACE FUNCTION delete_expired_exam()
RETURNS TRIGGER AS $$
BEGIN

IF NEW.date_of_exam < CURRENT_DATE THEN
    DELETE FROM Exams
    WHERE exam_id = NEW.exam_id;
END IF;

RETURN NEW;

END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_delete_exam
AFTER INSERT ON Exams
FOR EACH ROW
EXECUTE FUNCTION delete_expired_exam();

-- Room capacity check

CREATE OR REPLACE FUNCTION check_room_capacity()
RETURNS TRIGGER AS $$
DECLARE
    room_cap INT;
    students INT;
BEGIN

SELECT capacity INTO room_cap
FROM Rooms
WHERE building_name = NEW.building_name
AND room_number = NEW.room_number;

SELECT COUNT(*) INTO students
FROM Exam_Seating
WHERE exam_id = NEW.exam_id;

IF students >= room_cap THEN
    RAISE EXCEPTION 'Room capacity exceeded';
END IF;

RETURN NEW;

END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_room_capacity
BEFORE INSERT ON Exam_Seating
FOR EACH ROW
EXECUTE FUNCTION check_room_capacity();

-- Delete from On_Leave after leave end date

CREATE OR REPLACE FUNCTION remove_leave_student()
RETURNS TRIGGER AS $$
BEGIN

IF NEW.end_date < CURRENT_DATE THEN
    DELETE FROM On_leave
    WHERE student_id = NEW.student_id;
END IF;

RETURN NEW;

END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_remove_leave
AFTER UPDATE ON On_leave
FOR EACH ROW
EXECUTE FUNCTION remove_leave_student();