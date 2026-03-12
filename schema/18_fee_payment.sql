-- Fee Payment table
-- Stores student fee payment records

CREATE TABLE Fee_Payment (
    payment_id INT PRIMARY KEY,
    student_id INT,
    amount_paid NUMERIC,
    total_amount NUMERIC,
    payment_date DATE
);