-- Balance for each student in a particular semester

CREATE TABLE Balance(
    student_id INT PRIMARY KEY,
    remaining_balance INT CHECK (remaining_balance>=0)
);