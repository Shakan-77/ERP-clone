const express = require('express');
const cors = require('cors');
const pool = require('./db');
const bcrypt = require('bcrypt');

const app = express();

app.use(cors());
app.use(express.json());

const transporter = require('./mail');


pool.query("SELECT NOW()", (err) => {
  if (err) {
    console.log("Database connection failed", err);
  } else {
    console.log("Database connected");
  }
});

async function isRegistrationOpen() {
  const result = await pool.query(
    "SELECT registration_close_date FROM System_Config WHERE config_id = 1"
  );

  if (result.rows.length === 0) return false;

  const closeDate = result.rows[0].registration_close_date;
  return new Date(closeDate) >= new Date();
}


app.get('/', (req, res) => {
  res.send("Backend is running");
});


app.post('/signup', async (req, res) => {
  const { user_id, password, role } = req.body;

  try {
    const userCheck = await pool.query(
      "SELECT 1 FROM Users WHERE user_id = $1",
      [user_id]
    );

    if (userCheck.rows.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      "INSERT INTO Users (user_id, password, role) VALUES ($1, $2, $3)",
      [user_id, hashedPassword, role]
    );

    if (role === "Student") {
      await pool.query(
        "INSERT INTO Students (student_id) VALUES ($1)",
        [user_id]
      );
    }

    if (role === "Faculty") {
      await pool.query(
        "INSERT INTO Faculty (faculty_id) VALUES ($1)",
        [user_id]
      );
    }

    res.json({ message: "Signup successful" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

app.post('/login', async (req, res) => {
  const { user_id, password } = req.body;

  try {
    const result = await pool.query(
      "SELECT * FROM Users WHERE user_id = $1",
      [user_id]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "User not found" });
    }

    const user = result.rows[0];

    // bcrypt check
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    res.json({
      message: "Login successful",
      role: user.role
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

app.post('/student/profile', async (req, res) => {
  const {
    student_id,
    contact_no,
    college_email,
    personal_email,
    residence_address,
    join_date,
    semester,
    department_id,
    discipline_id
  } = req.body;

  try {
    const result = await pool.query(
      `UPDATE Students
       SET contact_no = $1,
           college_email = $2,
           personal_email = $3,
           residence_address = $4,
           join_date = $5,
           semester = $6,
           department_id = $7,
           discipline_id = $8
       WHERE student_id = $9
       RETURNING *`,
      [
        contact_no,
        college_email,
        personal_email,
        residence_address,
        join_date,
        semester,
        department_id,
        discipline_id,
        student_id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json({
      message: "Profile updated successfully",
      data: result.rows[0]
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating profile" });
  }
});

app.get('/student/profile/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "SELECT * FROM Students WHERE student_id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json(result.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching profile");
  }
});

app.get('/users', async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM Users");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching users");
  }
});

app.get('/student/registrations/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT * FROM Student_Registration_View WHERE student_id = $1`,
      [id]
    );

    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching registrations");
  }
});


app.post('/student/registration', async (req, res) => {
  const { student_id, course_offering_id, selected } = req.body;

  try {
    const open = await isRegistrationOpen();

    if (!open) {
      return res.status(403).json({
        message: "Registration window closed"
      });
    }

    await pool.query(
      `UPDATE Course_Registration
       SET selected = $1
       WHERE student_id = $2
       AND course_offering_id = $3`,
      [selected, student_id, course_offering_id]
    );

    res.json({ message: "Course selection updated" });

  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating selection");
  }
});


app.get('/faculty/pending/:faculty_id', async (req, res) => {
  const { faculty_id } = req.params;

  try {
    const result = await pool.query(
      `SELECT DISTINCT srv.student_id,srv.student_name
       FROM Student_Registration_View srv
       JOIN Faculty_Advisory_Students fas 
         ON srv.student_id = fas.student_id
       WHERE fas.faculty_id = $1
       AND srv.selected = TRUE
       AND srv.approved = FALSE`,
      [faculty_id]
    );

    res.json(result.rows);

  } catch (err) {
    res.status(500).send("Error fetching approvals");
  }
});

app.get('/faculty/student-courses/:student_id', async (req, res) => {
  const { student_id } = req.params;

  try {
    const result = await pool.query(
      `SELECT 
          srv.course_offering_id,
          srv.course_id,
          srv.course_name,
          srv.faculty_name,
          srv.approved
       FROM Student_Registration_View srv
       WHERE srv.student_id = $1
       AND srv.approved = FALSE`,
      [student_id]
    );

    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching student courses");
  }
});


const transporter = require('./mail');

app.post('/faculty/approve', async (req, res) => {
  const { student_id, course_offering_id } = req.body;

  try {
    await pool.query(
      `UPDATE Course_Registration
       SET approved = TRUE
       WHERE student_id = $1
       AND course_offering_id = $2`,
      [student_id, course_offering_id]
    );

    const pending = await pool.query(
      `SELECT 1 FROM Course_Registration
       WHERE student_id = $1 AND approved = FALSE`,
      [student_id]
    );

    if (pending.rows.length > 0) {
      return res.json({ message: "Course approved (waiting for all approvals)" });
    }

    const studentRes = await pool.query(
      `SELECT college_email FROM Students WHERE student_id = $1`,
      [student_id]
    );

    const email = studentRes.rows[0].college_email;

    const coursesRes = await pool.query(
      `SELECT course_name, faculty_name, semester
       FROM Student_Course_View
       WHERE student_id = $1`,
      [student_id]
    );

    let courseList = coursesRes.rows
      .map(c => `• ${c.course_name} (Faculty: ${c.faculty_name}, Sem: ${c.semester})`)
      .join('\n');

    await transporter.sendMail({
      from: '23cs01028@iitbbs.ac.in',
      to: email,
      subject: 'Course Registration Approved',
      text: `Your course registration is fully approved.\n\nRegistered Courses:\n${courseList}`
    });

    res.json({ message: "All courses approved. Email sent." });

  } catch (err) {
    console.error(err);
    res.status(500).send("Error approving course");
  }
});

app.get('/student/courses/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT * FROM Student_Course_View
       WHERE student_id = $1`,
      [id]
    );

    res.json(result.rows);

  } catch (err) {
    res.status(500).send("Error fetching courses");
  }
});

app.get('/student/:id/fee-status', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            `SELECT * FROM Student_Fee_Status WHERE student_id = $1`,
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Student not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

app.post('/student/:id/pay', async (req, res) => {
  const { id } = req.params;
  const { semester, amount_paid } = req.body;

  const client = await pool.connect();

  let remainingBalance;
  let paymentData;
  let email;

  try {
    await client.query('BEGIN');

    const insertPayment = await client.query(
      `INSERT INTO Fee_Payment (student_id, semester, amount_paid, payment_date)
       VALUES ($1, $2, $3, CURRENT_DATE)
       RETURNING *`,
      [id, semester, amount_paid]
    );

    paymentData = insertPayment.rows[0];

    const balanceRes = await client.query(
      `SELECT remaining_balance FROM Balance WHERE student_id = $1`,
      [id]
    );

    remainingBalance = balanceRes.rows[0].remaining_balance;

    const studentRes = await client.query(
      `SELECT college_email FROM Students WHERE student_id = $1`,
      [id]
    );

    email = studentRes.rows[0].college_email;

    await client.query('COMMIT');

  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    return res.status(500).json({ message: "Transaction failed" });
  } finally {
    client.release();
  }

  try {
    if (remainingBalance === 0) {

      const transcriptRes = await pool.query(
        `SELECT semester, amount_paid, payment_date
         FROM Fee_Payment
         WHERE student_id = $1 AND semester = $2
         ORDER BY payment_date`,
        [id, semester]
      );

      let transcriptText = `Fee Payment Transcript (Semester ${semester}):\n\n`;

      transcriptRes.rows.forEach((row, index) => {
        transcriptText += `Payment ${index + 1}:\n`;
        transcriptText += `Amount: ₹${row.amount_paid}\n`;
        transcriptText += `Date: ${row.payment_date}\n\n`;
      });

      await transporter.sendMail({
        from: '23cs01028@iitbbs.ac.in',
        to: email,
        subject: 'Fee Payment Complete + Transcript',
        text: `Hello,

Your fee payment is fully completed.

${transcriptText}

Thank you!`
      });
    }
  } catch (mailErr) {
    console.error("Email failed:", mailErr);
  }

  res.json({
    message: "Payment successful",
    payment: paymentData,
    remaining_balance: remainingBalance
  });
});


app.get('/student/:id/payment-history', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            `SELECT * FROM Student_Payment_History WHERE student_id = $1`,
            [id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

app.get('/student/:id/faculty-advisor', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            `SELECT * FROM Student_Faculty_Advisor WHERE student_id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Faculty Advisor not assigned' });
        }

        res.json(result.rows[0]);

    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

app.get('/student/:id/current-sgpa', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT semester, sgpa 
       FROM current_sem_sgpa 
       WHERE student_id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.json({ message: "No current SGPA found" });
    }

    res.json(result.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching current SGPA");
  }
});

app.get('/student/:id/cgpa', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT cgpa, total_credits 
       FROM Results 
       WHERE student_id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.json({ message: "No CGPA found" });
    }

    res.json(result.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching CGPA");
  }
});

app.get('/student/:id/previous-sgpa', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT semester, sgpa
       FROM Student_Previous_SGPA
       WHERE student_id = $1
       ORDER BY semester`,
      [id]
    );

    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching previous SGPA");
  }
});

app.get('/student/:id/current-courses', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT course_name, credits, grade
       FROM Student_Current_Sem_Courses_Grades
       WHERE student_id = $1`,
      [id]
    );

    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching current courses");
  }
});

app.get('/student/:id/semester/:sem/transcript', async (req, res) => {
  const { id, sem } = req.params;

  try {
    const result = await pool.query(
      `SELECT course_name, credits, grade
       FROM Student_All_Semester_Grades
       WHERE student_id = $1 AND semester = $2`,
      [id, sem]
    );

    if (result.rows.length === 0) {
      return res.json({ message: "No data for this semester" });
    }

    res.json({
      semester: sem,
      courses: result.rows
    });

  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching transcript");
  }
});

app.get('/student/:id/attendance', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT *
       FROM Student_Attendance_Summary
       WHERE student_id = $1`,
      [id]
    );

    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching attendance");
  }
});

app.get('/student/:id/feedback-courses', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT course_offering_id, course_name
       FROM Student_Course_View
       WHERE student_id = $1
       AND semester = (
         SELECT semester FROM Students WHERE student_id = $1
       )`,
      [id]
    );

    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching courses");
  }
});

app.post('/student/submit-feedback', async (req, res) => {
  let { student_id, course_offering_id, feedback } = req.body;

  try {
    feedback = feedback.trim();

    await pool.query(
      `SELECT submit_feedback($1, $2, $3)`,
      [student_id, course_offering_id, feedback]
    );

    res.json({ message: "Feedback submitted successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

app.post('/student/apply-leave', async (req, res) => {
  let { student_id, start_date, end_date, reason } = req.body;

  try {
    reason = reason.trim();

    await pool.query(
      `SELECT apply_leave($1, $2, $3, $4)`,
      [student_id, start_date, end_date, reason]
    );

    res.json({ message: "Leave request submitted successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

app.get('/student/:id/leave-requests', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT *
       FROM Student_Leave_Requests
       WHERE student_id = $1
       ORDER BY start_date DESC`,
      [id]
    );

    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching leave requests");
  }
});

app.post('/student/apply-fee-remission', async (req, res) => {
  const { student_id } = req.body;

  try {
    await pool.query(
      `SELECT apply_fee_remission($1)`,
      [student_id]
    );

    res.json({ message: "Fee remission application submitted" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

app.get('/student/:id/fee-remission-status', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT status
       FROM Fee_Remission_Application
       WHERE student_id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.json({ status: "Not Applied" });
    }

    res.json(result.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching status");
  }
});



app.listen(3000, () => {
  console.log("Server running on port 3000");
});