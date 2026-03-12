-- Prerequisites table
-- Stores prerequisite relationships between courses

CREATE TABLE Prerequisites (
    main_course_id INT,
    prereq_course_id INT,

    PRIMARY KEY(main_course_id, prereq_course_id)
);