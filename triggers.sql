-- Update semester for all students at the end of each semester

CREATE OR REPLACE FUNCTION update_semester()
RETURNS TRIGGER AS $$
DECLARE
    months_diff INT;
BEGIN

    months_diff := EXTRACT(YEAR FROM AGE(CURRENT_DATE, NEW.join_date)) * 12 + EXTRACT(MONTH FROM AGE(CURRENT_DATE, NEW.join_date));

    NEW.semester := (months_diff / 6) + 1;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_semester
BEFORE INSERT OR UPDATE OF join_date
ON Students
FOR EACH ROW
EXECUTE FUNCTION update_semester();

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
BEFORE INSERT ON Course_Registration
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

-- Clearing Backlogs

CREATE OR REPLACE FUNCTION remove_backlog_on_pass()
RETURNS TRIGGER AS $$
BEGIN

    IF OLD.grade = 'F' AND NEW.grade <> 'F' THEN

        DELETE FROM Backlogs
        WHERE student_id = NEW.student_id
        AND course_id = NEW.course_id;

    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_remove_backlog
AFTER UPDATE OF grade
ON Grades
FOR EACH ROW
EXECUTE FUNCTION remove_backlog_on_pass();

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

--Update Balance after fees update in discipline by admin

CREATE OR REPLACE FUNCTION set_balance_from_discipline_fee()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE Balance b
    SET remaining_balance = NEW.fees
    FROM Students s
    WHERE b.student_id = s.student_id
    AND s.discipline_id = NEW.discipline_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_set_balance_from_discipline
AFTER UPDATE OF fees
ON Discipline
FOR EACH ROW
EXECUTE FUNCTION set_balance_from_discipline_fee();

-- Insert into Course Registration when Registration Window Opens

CREATE OR REPLACE FUNCTION generate_registration_courses(p_student_id INT, p_semester INT)
RETURNS VOID AS $$
DECLARE
    due_balance INT;
    stud_discipline INT;
    stud_department INT;
BEGIN

    SELECT discipline_id, department_id
    INTO stud_discipline, stud_department
    FROM Students
    WHERE student_id = p_student_id;

    SELECT remaining_balance
    INTO due_balance
    FROM Balance
    WHERE student_id = p_student_id;

    IF due_balance IS NULL THEN
        due_balance := 0;
    END IF;

    IF due_balance > 0 THEN
        RAISE EXCEPTION 'Student has pending fees. Cannot register courses.';
    END IF;

    INSERT INTO Course_Registration (student_id, course_id, semester)
    SELECT
        p_student_id,
        co.course_id,
        p_semester
    FROM Course_Offerings co
    JOIN Courses c
        ON co.course_id = c.course_id
    WHERE co.semester = p_semester
      AND co.year_offering = EXTRACT(YEAR FROM CURRENT_DATE)
      AND co.discipline_id = stud_discipline
      AND c.department_id = stud_department   
      AND NOT EXISTS (
        SELECT 1 FROM Course_Registration cr
        WHERE cr.student_id = p_student_id
        AND cr.course_id = co.course_id
    );

    INSERT INTO Course_Registration (student_id, course_id, semester)
    SELECT
        p_student_id,
        b.course_id,
        p_semester
    FROM Backlogs b
    JOIN Courses c
        ON b.course_id = c.course_id
    WHERE b.student_id = p_student_id
      AND c.department_id = stud_department
      AND EXISTS (
          SELECT 1 FROM Course_Offerings co
          WHERE co.course_id = b.course_id
            AND co.semester = p_semester
            AND co.year_offering = EXTRACT(YEAR FROM CURRENT_DATE)
      )
      AND NOT EXISTS (
        SELECT 1 FROM Course_Registration cr
        WHERE cr.student_id = p_student_id
        AND cr.course_id = b.course_id
    );

END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION trigger_generate_registrations()
RETURNS TRIGGER AS $$
DECLARE
    rec RECORD;
BEGIN

    IF NEW.registration_open_date IS NOT NULL
       AND CURRENT_DATE >= NEW.registration_open_date THEN

        FOR rec IN SELECT student_id, semester FROM Students LOOP

            PERFORM generate_registration_courses(rec.student_id, rec.semester);

        END LOOP;

    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_registration_open
AFTER INSERT OR UPDATE OF registration_open_date
ON System_Config
FOR EACH ROW
EXECUTE FUNCTION trigger_generate_registrations();


--Move approved courses to Course_Allotted and remove from Course_Registration

CREATE OR REPLACE FUNCTION handle_course_approval()
RETURNS TRIGGER AS $$
BEGIN

    IF NEW.approved = TRUE THEN

        INSERT INTO Course_Allotted (student_id, course_id, semester)
        VALUES (NEW.student_id, NEW.course_id, NEW.semester);

        DELETE FROM Course_Registration
        WHERE student_id = NEW.student_id
          AND course_id = NEW.course_id
          AND semester = NEW.semester;

    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_handle_approval
AFTER UPDATE OF approved
ON Course_Registration
FOR EACH ROW
WHEN (NEW.approved = TRUE)
EXECUTE FUNCTION handle_course_approval();

