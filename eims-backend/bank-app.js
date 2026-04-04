const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const session = require('express-session');
const axios = require('axios');

const bankDB = require('./bank_db');

const app = express();

app.use(cors());
app.use(express.json());

app.use(session({
  secret: 'bank-secret',
  resave: false,
  saveUninitialized: true
}));

bankDB.query("SELECT NOW()", (err) => {
  if (err) console.log("DB failed", err);
  else console.log("Bank DB connected");
});


app.post('/signup', async (req, res) => {
  const { name, email, phone, password } = req.body;

  try {
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email, password required"
      });
    }

    if (
      !/[A-Z]/.test(password) ||
      !/[0-9]/.test(password) ||
      !/[^A-Za-z0-9]/.test(password)
    ) {
      return res.status(400).json({
        message: "Weak password"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await bankDB.query(
      `SELECT create_customer($1, $2, $3, $4)`,
      [name, email, phone, hashedPassword]
    );

    res.status(201).json({
      message: "Signup successful"
    });

  } catch (err) {

    if (err.code === '23505') {
      return res.status(400).json({
        message: "Email already exists"
      });
    }

    res.status(500).json({ message: "Server error" });
  }
});


app.get('/login', (req, res) => {
  res.send("Login using POST /login");
});

app.post('/login', async (req, res) => {
  const { identifier, password } = req.body;

  try {
    const result = await bankDB.query(
      `SELECT * FROM Customers WHERE email = $1 OR name = $1`,
      [identifier]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "User not found" });
    }

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    req.session.user = {
      customer_id: user.customer_id
    };

    res.json({
      message: "Login successful ✅"
    });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});


app.get('/pay-fees', (req, res) => {
  const { student_id, semester, amount } = req.query;

  req.session.payment = {
    student_id,
    semester,
    amount
  };

  req.session.save(() => {
    res.redirect('/login');
  });
});


app.post('/account/transfer', async (req, res) => {

  if (!req.session.payment) {
    return res.status(400).json({
      message: "No payment session found"
    });
  }

  if (!req.session.user) {
    return res.status(401).json({
      message: "Login required"
    });
  }

  const { student_id, semester, amount } = req.session.payment;
  const customer_id = req.session.user.customer_id;

  const COLLEGE_ACCOUNT = 999;

  try {
    const accRes = await bankDB.query(
      `SELECT account_id FROM Accounts WHERE customer_id = $1`,
      [customer_id]
    );

    const from_account = accRes.rows[0].account_id;

    const result = await bankDB.query(
      `SELECT transfer_amount($1, $2, $3) AS message`,
      [from_account, COLLEGE_ACCOUNT, amount]
    );

    if (result.rows[0].message !== 'Transfer successful') {
      return res.status(400).json({
        message: result.rows[0].message
      });
    }

    await axios.post('http://localhost:3000/student/payment-success', {
      student_id,
      semester,
      amount
    });

    res.json({
      message: "Payment successful ✅"
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Payment failed"
    });
  }
});


app.get('/account/:id/balance', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await bankDB.query(
      `SELECT balance FROM Accounts WHERE account_id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Account not found"
      });
    }

    res.json({
      balance: result.rows[0].balance
    });

  } catch (err) {
    res.status(500).send("Error fetching balance");
  }
});


app.post('/account/deposit', async (req, res) => {
  const { account_id, amount } = req.body;

  try {
    const result = await bankDB.query(
      `SELECT deposit_amount($1, $2) AS message`,
      [account_id, amount]
    );

    res.json({ message: result.rows[0].message });

  } catch (err) {
    res.status(500).send("Deposit error");
  }
});


app.post('/account/withdraw', async (req, res) => {
  const { account_id, amount } = req.body;

  try {
    const result = await bankDB.query(
      `SELECT withdraw_amount($1, $2) AS message`,
      [account_id, amount]
    );

    res.json({ message: result.rows[0].message });

  } catch (err) {
    res.status(500).send("Withdraw error");
  }
});


app.get('/account/:id/history', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await bankDB.query(`
      SELECT 
        transaction_id AS id,
        transaction_type AS type,
        amount,
        created_at,
        status
      FROM Transactions
      WHERE account_id = $1

      UNION ALL

      SELECT
        transfer_id AS id,
        CASE
          WHEN from_account = $1 THEN 'transfer_sent'
          ELSE 'transfer_received'
        END AS type,
        amount,
        created_at,
        status
      FROM Transfers
      WHERE from_account = $1 OR to_account = $1

      ORDER BY created_at DESC
    `, [id]);

    res.json(result.rows);

  } catch (err) {
    res.status(500).send("History error");
  }
});


app.listen(4000, () => {
  console.log("Bank server running on port 4000 🚀");
});