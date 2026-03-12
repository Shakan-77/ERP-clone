-- Fee Payment table
-- Stores student fee payment records

CREATE TABLE Fee_Payment (
    payment_id INT PRIMARY KEY,
    student_id INT,
    amount_paid NUMERIC CHECK (amount_paid >= 0),
    total_amount NUMERIC CHECK (total_amount > 0),
    payment_date DATE
);