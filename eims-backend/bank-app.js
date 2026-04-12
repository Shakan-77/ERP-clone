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

app.use(express.urlencoded({ extended: true }));

bankDB.query("SELECT NOW()", (err) => {
  if (err) console.log("DB failed", err);
  else console.log("Bank DB connected");
});

app.get('/', (req, res) => {
  const { student_id, semester, amount } = req.query;

  if (!student_id || !semester || !amount) {
    return res.status(400).send("Missing payment parameters");
  }

  // If already logged in, show payment confirmation
  if (req.session.user) {
    return res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Payment Confirmation</title>
        <style>
          body { font-family: Arial; max-width: 500px; margin: 50px auto; padding: 20px; background: #f5f5f5; }
          .container { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          h2 { color: #0066cc; margin-bottom: 20px; }
          .info-box { background: #f9f9f9; border-left: 4px solid #0066cc; padding: 15px; margin: 15px 0; }
          .label { color: #666; font-size: 14px; }
          .value { color: #333; font-size: 18px; font-weight: bold; }
          .amount { color: #28a745; font-size: 24px; margin: 20px 0; }
          button { width: 100%; padding: 12px; background: #28a745; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; margin-top: 20px; }
          button:hover { background: #218838; }
          .cancel-btn { background: #6c757d; margin-top: 10px; }
          .cancel-btn:hover { background: #5a6268; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>💳 Confirm Payment</h2>
          <div class="info-box">
            <div class="label">Student ID</div>
            <div class="value">${student_id}</div>
          </div>
          <div class="info-box">
            <div class="label">Semester</div>
            <div class="value">${semester}</div>
          </div>
          <div class="info-box">
            <div class="label">Amount to Pay</div>
            <div class="amount">₹ ${parseFloat(amount).toLocaleString('en-IN')}</div>
          </div>
          <form method="POST" action="/process-payment">
            <input type="hidden" name="student_id" value="${student_id}">
            <input type="hidden" name="semester" value="${semester}">
            <input type="hidden" name="amount" value="${amount}">
            <button type="submit">✅ Proceed with Payment</button>
          </form>
          <button class="cancel-btn" onclick="history.back()">❌ Cancel</button>
        </div>
      </body>
      </html>
    `);
  }

  // Not logged in, show login/signup options
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Bank Payment Portal</title>
      <style>
        body { font-family: Arial; background: linear-gradient(135deg, #0066cc 0%, #0052a3 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; }
        .container { background: white; padding: 40px; border-radius: 10px; max-width: 500px; width: 100%; box-shadow: 0 10px 30px rgba(0,0,0,0.3); }
        h1 { color: #0066cc; text-align: center; margin-bottom: 30px; }
        .payment-info { background: #f0f8ff; border-left: 4px solid #0066cc; padding: 15px; margin: 20px 0; border-radius: 5px; }
        .info-row { display: flex; justify-content: space-between; margin: 10px 0; }
        .label { color: #666; font-weight: bold; }
        .value { color: #0066cc; font-weight: bold; }
        .amount-highlight { color: #28a745; font-size: 20px; margin-top: 10px; }
        .button-group { margin-top: 30px; }
        button { width: 100%; padding: 12px; margin: 10px 0; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; font-weight: bold; }
        .login-btn { background: #0066cc; color: white; }
        .login-btn:hover { background: #0052a3; }
        .signup-btn { background: #28a745; color: white; }
        .signup-btn:hover { background: #218838; }
        .divider { text-align: center; margin: 20px 0; color: #999; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🏦 Bank Payment Portal</h1>
        
        <div class="payment-info">
          <div class="info-row">
            <span class="label">Student ID:</span>
            <span class="value">${student_id}</span>
          </div>
          <div class="info-row">
            <span class="label">Semester:</span>
            <span class="value">${semester}</span>
          </div>
          <div class="info-row">
            <span class="label">Amount Due:</span>
            <span class="value">₹ ${parseFloat(amount).toLocaleString('en-IN')}</span>
          </div>
          <div class="amount-highlight">💳 Secure Payment Processing</div>
        </div>

        <div class="button-group">
          <form method="GET" action="/login" style="margin: 0;">
            <input type="hidden" name="student_id" value="${student_id}">
            <input type="hidden" name="semester" value="${semester}">
            <input type="hidden" name="amount" value="${amount}">
            <button type="submit" class="login-btn">🔐 Login to Bank Account</button>
          </form>
          
          <div class="divider">OR</div>
          
          <form method="GET" action="/signup" style="margin: 0;">
            <input type="hidden" name="student_id" value="${student_id}">
            <input type="hidden" name="semester" value="${semester}">
            <input type="hidden" name="amount" value="${amount}">
            <button type="submit" class="signup-btn">✨ Create New Bank Account</button>
          </form>
        </div>
      </div>
    </body>
    </html>
  `);
});

app.post('/signup', async (req, res) => {
  const { name, email, phone, password, student_id, semester, amount } = req.body;

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

    // Create customer
    await bankDB.query(
      `SELECT create_customer($1, $2, $3, $4)`,
      [name, email, phone, hashedPassword]
    );

    // Get the newly created customer and their account
    const customerResult = await bankDB.query(
      `SELECT customer_id FROM Customers WHERE email = $1 ORDER BY customer_id DESC LIMIT 1`,
      [email]
    );

    if (customerResult.rows.length === 0) {
      return res.status(400).json({ message: "Account creation failed" });
    }

    const customerId = customerResult.rows[0].customer_id;

    // Get the account created for this customer
    const accountResult = await bankDB.query(
      `SELECT account_id FROM Accounts WHERE customer_id = $1 LIMIT 1`,
      [customerId]
    );

    const accountId = accountResult.rows.length > 0 ? accountResult.rows[0].account_id : 'N/A';

    // Store payment details in session if provided
    if (student_id && semester && amount) {
      req.session.payment = {
        student_id,
        semester,
        amount
      };
      req.session.save();
    }

    const redirectUrl = (student_id && semester && amount) 
      ? `/?student_id=${student_id}&semester=${semester}&amount=${amount}`
      : '/login';

    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Account Created</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial; background: linear-gradient(135deg, #28a745 0%, #1e7e34 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center; }
          .modal { background: white; padding: 50px 40px; border-radius: 15px; max-width: 450px; width: 90%; box-shadow: 0 10px 40px rgba(0,0,0,0.3); text-align: center; }
          .icon { font-size: 60px; margin-bottom: 20px; }
          h2 { color: #28a745; margin-bottom: 15px; font-size: 28px; }
          p { color: #666; margin: 10px 0; }
          .account-id-box { background: #f0f0f0; border: 3px solid #0066cc; padding: 25px; border-radius: 10px; margin: 30px 0; }
          .account-id-label { color: #0066cc; font-weight: bold; font-size: 18px; margin-bottom: 10px; }
          .account-id-value { font-size: 42px; font-weight: bold; color: #0066cc; word-break: break-all; letter-spacing: 3px; }
          .warning { color: #dc3545; font-weight: bold; font-size: 14px; margin-top: 15px; }
          button { width: 100%; padding: 15px; background: #0066cc; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 18px; font-weight: bold; margin-top: 30px; }
          button:hover { background: #0052a3; }
        </style>
      </head>
      <body>
        <div class="modal">
          <div class="icon">✅</div>
          <h2>Account Created Successfully!</h2>
          <p>Your bank account has been created.</p>
          
          <div class="account-id-box">
            <div class="account-id-label">Your Account ID is:</div>
            <div class="account-id-value">${accountId}</div>
          </div>
          
          <p style="color: #666; font-size: 16px;">Save your Account ID for future login</p>
          <p class="warning">⚠️ You will need this ID to login to your account</p>
          
          <button onclick="window.location.href='${redirectUrl}'">✅ OK, I've Saved My Account ID</button>
        </div>
      </body>
      </html>
    `);

  } catch (err) {

    if (err.code === '23505') {
      return res.status(400).json({
        message: "Email already exists"
      });
    }

    res.status(500).json({ message: "Server error" });
  }
});

app.get('/signup', (req, res) => {
  const { student_id, semester, amount } = req.query;
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Bank Signup</title>
      <style>
        body { font-family: Arial; max-width: 500px; margin: 50px auto; padding: 20px; background: #f5f5f5; }
        .container { background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h2 { color: #28a745; margin-bottom: 20px; }
        input { width: 100%; padding: 10px; margin: 10px 0; border: 1px solid #ccc; border-radius: 5px; box-sizing: border-box; }
        button { width: 100%; padding: 10px; background: #28a745; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; margin-top: 15px; }
        button:hover { background: #218838; }
        .login-link { text-align: center; margin-top: 20px; color: #666; }
        .login-link a { color: #0066cc; text-decoration: none; }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>✨ Create Bank Account</h2>
        <form method="POST" action="/signup">
          <input type="text" name="name" placeholder="Full Name" required>
          <input type="email" name="email" placeholder="Email" required>
          <input type="tel" name="phone" placeholder="Phone Number" required>
          <input type="password" name="password" placeholder="PIN (Must have uppercase, number, special char)" required>
          <input type="hidden" name="student_id" value="${student_id || ''}">
          <input type="hidden" name="semester" value="${semester || ''}">
          <input type="hidden" name="amount" value="${amount || ''}">
          <button type="submit">Create Account</button>
        </form>
        <div class="login-link">
          Already have an account? <a href="/login?student_id=${student_id || ''}&semester=${semester || ''}&amount=${amount || ''}">Login</a>
        </div>
      </div>
    </body>
    </html>
  `);
});



app.get('/login', (req, res) => {
  const { student_id, semester, amount } = req.query;
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Bank Login</title>
      <style>
        body { font-family: Arial; max-width: 450px; margin: 50px auto; padding: 20px; background: #f5f5f5; }
        .container { background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h2 { color: #0066cc; margin-bottom: 20px; }
        input { width: 100%; padding: 10px; margin: 10px 0; border: 1px solid #ccc; border-radius: 5px; box-sizing: border-box; }
        button { width: 100%; padding: 10px; background: #0066cc; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; margin-top: 10px; }
        button:hover { background: #0052a3; }
        .signup-link { text-align: center; margin-top: 20px; color: #666; }
        .signup-link a { color: #28a745; text-decoration: none; }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>🔐 Bank Login</h2>
        <form method="POST" action="/login">
          <input type="number" name="account_id" placeholder="Account ID" required>
          <input type="text" name="identifier" placeholder="Email or Name" required>
          <input type="password" name="password" placeholder="PIN" required>
          <input type="hidden" name="student_id" value="${student_id || ''}">
          <input type="hidden" name="semester" value="${semester || ''}">
          <input type="hidden" name="amount" value="${amount || ''}">
          <button type="submit">Login</button>
        </form>
        <div class="signup-link">
          Don't have an account? <a href="/signup?student_id=${student_id || ''}&semester=${semester || ''}&amount=${amount || ''}">Create one</a>
        </div>
      </div>
    </body>
    </html>
  `);
});

app.get('/dashboard', async (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }

  try {
    const { account_id, customer_id } = req.session.user;

    // Get account details
    const accountResult = await bankDB.query(
      `SELECT a.account_id, a.balance, a.account_type, a.status, c.name, c.email 
       FROM Accounts a 
       JOIN Customers c ON a.customer_id = c.customer_id 
       WHERE a.account_id = $1 AND a.customer_id = $2`,
      [account_id, customer_id]
    );

    if (accountResult.rows.length === 0) {
      return res.status(404).send("Account not found");
    }

    const account = accountResult.rows[0];

    // Get recent transactions
    const transactionsResult = await bankDB.query(
      `SELECT transaction_id, transaction_type, amount, status, created_at 
       FROM Transactions 
       WHERE account_id = $1 
       ORDER BY created_at DESC 
       LIMIT 10`,
      [account_id]
    );

    const transactions = transactionsResult.rows;

    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Bank Dashboard</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial; background: #f5f5f5; }
          header { background: #0066cc; color: white; padding: 20px; text-align: center; }
          .container { max-width: 1000px; margin: 20px auto; padding: 20px; }
          .logout { position: absolute; top: 20px; right: 20px; }
          .logout a { color: white; text-decoration: none; padding: 8px 15px; background: rgba(255,255,255,0.2); border-radius: 5px; }
          .logout a:hover { background: rgba(255,255,255,0.3); }
          
          .account-info { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
          .info-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 10px 0; border-bottom: 1px solid #ddd; }
          .info-row:last-child { border-bottom: none; }
          .label { font-weight: bold; color: #666; }
          .value { color: #333; }
          .balance { font-size: 24px; color: #28a745; font-weight: bold; }
          
          .actions { display: flex; gap: 10px; margin: 20px 0; flex-wrap: wrap; }
          button { padding: 12px 25px; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; font-weight: bold; }
          .btn-deposit { background: #28a745; color: white; }
          .btn-deposit:hover { background: #218838; }
          .btn-withdraw { background: #6c757d; color: white; }
          .btn-withdraw:hover { background: #5a6268; }
          .btn-logout { background: #dc3545; color: white; }
          .btn-logout:hover { background: #c82333; }
          
          .transactions { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
          .transaction-item { padding: 12px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; }
          .transaction-item:last-child { border-bottom: none; }
          .transaction-type { font-weight: bold; }
          .debit { color: #dc3545; }
          .credit { color: #28a745; }
          .transaction-date { color: #999; font-size: 12px; }
          h2 { color: #0066cc; margin-top: 20px; margin-bottom: 15px; }
          h3 { color: #666; margin-bottom: 10px; }
        </style>
      </head>
      <body>
        <header>
          <h1>🏦 Bank Dashboard</h1>
          <p>Welcome ${account.name}</p>
          <div class="logout">
            <a href="/logout">Logout</a>
          </div>
        </header>

        <div class="container">
          <div class="account-info">
            <h2>Account Information</h2>
            <div class="info-row">
              <span class="label">Account ID:</span>
              <span class="value">${account.account_id}</span>
            </div>
            <div class="info-row">
              <span class="label">Account Type:</span>
              <span class="value">${account.account_type.charAt(0).toUpperCase() + account.account_type.slice(1)}</span>
            </div>
            <div class="info-row">
              <span class="label">Status:</span>
              <span class="value">${account.status}</span>
            </div>
            <div class="info-row">
              <span class="label">Email:</span>
              <span class="value">${account.email}</span>
            </div>
            <div class="info-row">
              <span class="label">Current Balance:</span>
              <span class="value balance">₹ ${parseFloat(account.balance).toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div class="actions">
            <button class="btn-deposit" onclick="showDepositForm()">💰 Deposit Funds</button>
            <button class="btn-withdraw" onclick="showWithdrawForm()">🏧 Withdraw Funds</button>
            <button class="btn-logout" onclick="confirmLogout()">🚪 Logout</button>
          </div>

          <div class="transactions">
            <h2>Recent Transactions</h2>
            ${transactions.length > 0 ? `
              ${transactions.map(t => `
                <div class="transaction-item">
                  <div>
                    <div class="transaction-type ${t.transaction_type === 'debit' ? 'debit' : 'credit'}">
                      ${t.transaction_type === 'debit' ? '💸 Debit' : '💳 Credit'} - ${t.status}
                    </div>
                    <div class="transaction-date">${new Date(t.created_at).toLocaleDateString()}</div>
                  </div>
                  <div class="value ${t.transaction_type === 'debit' ? 'debit' : 'credit'}">
                    ${t.transaction_type === 'debit' ? '-' : '+'} ₹ ${parseFloat(t.amount).toLocaleString('en-IN')}
                  </div>
                </div>
              `).join('')}
            ` : '<p style="color: #999;">No transactions yet</p>'}
          </div>
        </div>

        <script>
          function showDepositForm() {
            const amount = prompt('Enter amount to deposit (₹):', '');
            if (amount && !isNaN(amount) && amount > 0) {
              window.location.href = '/deposit?amount=' + amount;
            }
          }

          function showWithdrawForm() {
            const amount = prompt('Enter amount to withdraw (₹):', '');
            if (amount && !isNaN(amount) && amount > 0) {
              window.location.href = '/withdraw?amount=' + amount;
            }
          }

          function confirmLogout() {
            if (confirm('Are you sure you want to logout?')) {
              window.location.href = '/logout';
            }
          }
        </script>
      </body>
      </html>
    `);

  } catch (err) {
    console.error(err);
    res.status(500).send(`Error: ${err.message}`);
  }
});

app.post('/login', async (req, res) => {
  const { account_id, identifier, password, student_id, semester, amount } = req.body;

  try {
    if (!account_id || !identifier || !password) {
      return res.status(400).send("All fields required");
    }

    const result = await bankDB.query(
      `SELECT * FROM Customers WHERE email = $1 OR name = $1`,
      [identifier]
    );

    if (result.rows.length === 0) {
      return res.status(401).send("User not found");
    }

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).send("Invalid password");
    }

    req.session.user = {
      customer_id: user.customer_id,
      account_id: account_id
    };

    // Store payment details in session if provided
    if (student_id && semester && amount) {
      req.session.payment = {
        student_id,
        semester,
        amount
      };
    }

    req.session.save(() => {
      // Redirect to payment confirmation if payment details exist
      if (student_id && semester && amount) {
        res.redirect(`/?student_id=${student_id}&semester=${semester}&amount=${amount}`);
      } else {
        // Redirect to dashboard
        res.redirect('/dashboard');
      }
    });

  } catch (err) {
    res.status(500).send("Server error");
  }
});

app.post('/process-payment', async (req, res) => {
  const { student_id, semester, amount } = req.body;

  try {
    if (!req.session.user) {
      return res.status(401).send("Not logged in");
    }

    if (!student_id || !semester || !amount) {
      return res.status(400).send("Missing payment details");
    }

    const { account_id, customer_id } = req.session.user;

    // Get account details from bank database
    const accountResult = await bankDB.query(
      `SELECT account_id, balance FROM Accounts WHERE customer_id = $1 AND account_id = $2`,
      [customer_id, account_id]
    );

    if (accountResult.rows.length === 0) {
      return res.status(404).send("Account not found");
    }

    const account = accountResult.rows[0];
    const paymentAmount = parseFloat(amount);

    if (account.balance < paymentAmount) {
      // Show dashboard with insufficient balance message
      const transactionsResult = await bankDB.query(
        `SELECT account_id, transaction_type, amount, status, created_at FROM Transactions 
         WHERE account_id = $1 ORDER BY created_at DESC LIMIT 10`,
        [account_id]
      );

      const transactions = transactionsResult.rows;
      const shortfallAmount = (paymentAmount - account.balance).toFixed(2);

      return res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Bank Dashboard</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial; background: #f5f5f5; }
            header { background: #0066cc; color: white; padding: 20px; text-align: center; }
            .container { max-width: 1000px; margin: 20px auto; padding: 20px; }
            .alert { background: #fff3cd; border: 1px solid #ffc107; color: #856404; padding: 15px; margin: 20px 0; border-radius: 5px; }
            .alert h3 { margin-bottom: 10px; color: #dc3545; }
            .account-info { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
            .info-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 10px 0; border-bottom: 1px solid #ddd; }
            .info-row:last-child { border-bottom: none; }
            .label { font-weight: bold; color: #666; }
            .value { color: #333; }
            .balance { font-size: 24px; color: #28a745; }
            .required-amount { font-size: 24px; color: #dc3545; }
            .shortfall { font-size: 20px; color: #ff6b6b; }
            .transactions { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
            .transaction-item { padding: 12px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; }
            .transaction-item:last-child { border-bottom: none; }
            .transaction-type { font-weight: bold; }
            .debit { color: #dc3545; }
            .credit { color: #28a745; }
            .transaction-date { color: #999; font-size: 12px; }
            .actions { display: flex; gap: 10px; margin: 20px 0; flex-wrap: wrap; }
            button { padding: 12px 25px; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; font-weight: bold; }
            .btn-deposit { background: #28a745; color: white; }
            .btn-deposit:hover { background: #218838; }
            .btn-withdraw { background: #6c757d; color: white; }
            .btn-withdraw:hover { background: #5a6268; }
            .btn-retry { background: #0066cc; color: white; }
            .btn-retry:hover { background: #0052a3; }
            .payment-pending { background: #e7f3ff; border: 1px solid #b3d9ff; padding: 15px; margin: 20px 0; border-radius: 5px; }
            h2 { color: #0066cc; margin-top: 20px; margin-bottom: 15px; }
            h3 { color: #666; margin-bottom: 10px; }
          </style>
        </head>
        <body>
          <header>
            <h1>🏦 Bank Dashboard</h1>
            <p>Account ID: ${account_id}</p>
          </header>

          <div class="container">
            <div class="alert">
              <h3>⚠️ Insufficient Balance</h3>
              <p>You need additional funds to complete this payment.</p>
            </div>

            <div class="account-info">
              <h2>Account Summary</h2>
              <div class="info-row">
                <span class="label">Current Balance:</span>
                <span class="value balance">₹ ${account.balance.toLocaleString('en-IN')}</span>
              </div>
              <div class="info-row">
                <span class="label">Payment Required:</span>
                <span class="value required-amount">₹ ${paymentAmount.toLocaleString('en-IN')}</span>
              </div>
              <div class="info-row">
                <span class="label">Shortfall Amount:</span>
                <span class="value shortfall">₹ ${shortfallAmount}</span>
              </div>
            </div>

            <div class="payment-pending">
              <h3>📋 Pending Payment</h3>
              <p><strong>Student ID:</strong> ${student_id}</p>
              <p><strong>Semester:</strong> ${semester}</p>
              <p><strong>Amount:</strong> ₹ ${paymentAmount.toLocaleString('en-IN')}</p>
              <p style="margin-top: 10px; color: #0066cc;"><strong>Deposit ₹ ${shortfallAmount} to complete the payment</strong></p>
            </div>

            <div class="actions">
              <button class="btn-deposit" onclick="showDepositForm()">💰 Deposit Funds</button>
              <button class="btn-withdraw" onclick="showWithdrawForm()">🏧 Withdraw Funds</button>
              <button class="btn-retry" onclick="retryPayment()">🔄 Retry Payment</button>
            </div>

            <div class="transactions">
              <h2>Recent Transactions</h2>
              ${transactions.length > 0 ? `
                ${transactions.map(t => `
                  <div class="transaction-item">
                    <div>
                      <div class="transaction-type ${t.transaction_type === 'debit' ? 'debit' : 'credit'}">
                        ${t.transaction_type === 'debit' ? '💸 Debit' : '💳 Credit'} - ${t.status}
                      </div>
                      <div class="transaction-date">${new Date(t.created_at).toLocaleDateString()}</div>
                    </div>
                    <div class="value ${t.transaction_type === 'debit' ? 'debit' : 'credit'}">
                      ${t.transaction_type === 'debit' ? '-' : '+'} ₹ ${t.amount.toLocaleString('en-IN')}
                    </div>
                  </div>
                `).join('')}
              ` : '<p style="color: #999;">No transactions yet</p>'}
            </div>
          </div>

          <script>
            function showDepositForm() {
              const amount = prompt('Enter amount to deposit (₹):', '${shortfallAmount}');
              if (amount && !isNaN(amount)) {
                window.location.href = '/deposit?amount=' + amount + '&student_id=${student_id}&semester=${semester}&payment_amount=${paymentAmount}';
              }
            }

            function showWithdrawForm() {
              const amount = prompt('Enter amount to withdraw (₹):', '');
              if (amount && !isNaN(amount)) {
                window.location.href = '/withdraw?amount=' + amount;
              }
            }

            function retryPayment() {
              if (confirm('Retry payment of ₹ ${paymentAmount}?')) {
                const form = document.createElement('form');
                form.method = 'POST';
                form.action = '/process-payment';
                
                const fields = {
                  student_id: '${student_id}',
                  semester: '${semester}',
                  amount: '${paymentAmount}'
                };
                
                for (let key in fields) {
                  const input = document.createElement('input');
                  input.type = 'hidden';
                  input.name = key;
                  input.value = fields[key];
                  form.appendChild(input);
                }
                
                document.body.appendChild(form);
                form.submit();
              }
            }
          </script>
        </body>
        </html>
      `);
    }

    // Process payment (deduct from account)
    const transactionResult = await bankDB.query(
      `UPDATE Accounts SET balance = balance - $1 WHERE account_id = $2 RETURNING balance`,
      [paymentAmount, account_id]
    );

    const newBalance = transactionResult.rows[0].balance;

    // Record transaction
    await bankDB.query(
      `INSERT INTO Transactions (account_id, transaction_type, amount, status) 
       VALUES ($1, $2, $3, $4)`,
      [account_id, 'debit', paymentAmount, 'success']
    );

    // Notify EIMS backend about successful payment
    try {
      await axios.post('http://localhost:5000/student/payment-success', {
        student_id,
        semester,
        amount: paymentAmount,
        account_id,
        payment_status: 'success'
      });
    } catch (err) {
      console.log("Could not notify EIMS backend:", err.message);
    }

    // Redirect to EIMS after successful payment
    res.redirect('http://localhost:3000');

  } catch (err) {
    console.error(err);
    res.status(500).send(`Payment failed: ${err.message}`);
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
  const { from_account_id, to_account_id, amount, purpose, student_id, semester } = req.body;

  try {
    if (!from_account_id || !amount) {
      return res.status(400).json({
        message: "from_account_id and amount are required"
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        message: "Invalid amount"
      });
    }

    // Check sufficient balance
    const balance_result = await bankDB.query(
      `SELECT balance FROM Accounts WHERE account_id = $1`,
      [from_account_id]
    );

    if (balance_result.rows.length === 0) {
      return res.status(404).json({
        message: "Account not found"
      });
    }

    if (balance_result.rows[0].balance < amount) {
      return res.status(400).json({
        message: "Insufficient balance"
      });
    }

    // Get college account ID (default: 999 or first account with status 'college')
    const collegeRes = await bankDB.query(
      `SELECT account_id FROM Accounts WHERE account_id = 999 LIMIT 1`
    );

    const to_account = collegeRes.rows.length > 0 ? collegeRes.rows[0].account_id : 999;

    // Perform transfer
    const result = await bankDB.query(
      `SELECT transfer_amount($1, $2, $3) AS message`,
      [from_account_id, to_account, amount]
    );

    if (result.rows[0].message !== 'Transfer successful') {
      return res.status(400).json({
        message: result.rows[0].message
      });
    }


    // Notify EIMS of successful payment
    try {
      console.log("Notifying EIMS about payment success...");
      const notifyRes = await axios.post('http://localhost:5000/student/payment-success', {
        student_id,
        semester,
        amount
      });
      console.log("EIMS notification response:", notifyRes.data);
    } catch (emsErr) {
      console.error('ERROR: Failed to notify EIMS -', emsErr.message);
      if (emsErr.response?.data) {
        console.error('Error details:', emsErr.response.data);
      }
    }

    res.json({
      message: "Payment successful ✅",
      amount: amount,
      student_id: student_id
    });

  } catch (err) {
    console.error('Transfer error:', err);
    res.status(500).json({
      message: "Payment failed",
      error: err.message
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


// Get customer balance by email or name
app.get('/customer/:identifier/balance', async (req, res) => {
  try {
    const result = await bankDB.query(
      `SELECT a.account_id, a.balance, a.account_type, c.email, c.name
       FROM Accounts a
       JOIN Customers c ON a.customer_id = c.customer_id
       WHERE c.email = $1 OR c.name = $1
       LIMIT 1`,
      [req.params.identifier]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Account not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching balance' });
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
      WHERE account_id = $1 AND transaction_type IN ('credit', 'debit')

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

// Create new bank account
app.post('/create-account', async (req, res) => {
  const { full_name, account_type, email, phone, pin, initial_balance } = req.body;

  try {
    if (!full_name || !email || !phone || !pin) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    if (pin.length < 4) {
      return res.status(400).json({
        message: "PIN must be at least 4 characters"
      });
    }

    if (initial_balance < 0) {
      return res.status(400).json({
        message: "Initial balance must be positive"
      });
    }

    // Hash PIN
    const hashedPin = await bcrypt.hash(pin, 10);

    // First, check if customer with this email already exists
    const existingCustomer = await bankDB.query(
      `SELECT customer_id FROM Customers WHERE email = $1`,
      [email]
    );

    let customerId;

    if (existingCustomer.rows.length > 0) {
      customerId = existingCustomer.rows[0].customer_id;
    } else {
      // Create new customer
      const customerResult = await bankDB.query(
        `INSERT INTO Customers (name, email, phone, password, created_at)
         VALUES ($1, $2, $3, $4, NOW())
         RETURNING customer_id`,
        [full_name, email, phone, hashedPin]
      );
      customerId = customerResult.rows[0].customer_id;
    }

    // Create account for this customer
    const accountResult = await bankDB.query(
      `INSERT INTO Accounts (customer_id, account_type, balance, status, created_at)
       VALUES ($1, $2, $3, 'active', NOW())
       RETURNING account_id`,
      [customerId, account_type, initial_balance]
    );

    const accountId = accountResult.rows[0].account_id;

    if (initial_balance > 0) {
      // Record initial deposit
      await bankDB.query(
        `INSERT INTO Transactions (account_id, transaction_type, amount, status)
         VALUES ($1, $2, $3, $4)`,
        [accountId, 'deposit', initial_balance, 'success']
      );
    }

    res.status(201).json({
      message: "Account created successfully",
      account_id: accountId,
      account_holder_name: full_name,
      balance: initial_balance
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Failed to create account",
      error: err.message
    });
  }
});

app.get('/deposit', (req, res) => {
  const { amount, student_id, semester, payment_amount } = req.query;

  if (!req.session.user) {
    return res.redirect('/login');
  }

  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Deposit Funds</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial; background: linear-gradient(135deg, #28a745 0%, #1e7e34 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; }
        .container { background: white; padding: 40px; border-radius: 15px; max-width: 500px; width: 100%; box-shadow: 0 10px 40px rgba(0,0,0,0.3); }
        h1 { color: #28a745; text-align: center; margin-bottom: 30px; }
        .info { background: #f0f8ff; border-left: 4px solid #0066cc; padding: 15px; margin: 20px 0; border-radius: 5px; }
        .info-row { display: flex; justify-content: space-between; margin: 8px 0; }
        .label { color: #666; font-weight: bold; }
        .value { color: #0066cc; font-weight: bold; }
        input { width: 100%; padding: 12px; margin: 15px 0; border: 2px solid #0066cc; border-radius: 5px; box-sizing: border-box; font-size: 16px; }
        button { width: 100%; padding: 12px; background: #28a745; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; font-weight: bold; margin-top: 20px; }
        button:hover { background: #218838; }
        .cancel-btn { background: #6c757d; margin-top: 10px; }
        .cancel-btn:hover { background: #5a6268; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>💰 Deposit Funds</h1>
        
        <div class="info">
          <div class="info-row">
            <span class="label">Current Amount:</span>
            <span class="value">₹ ${amount || '0'}</span>
          </div>
          <div class="info-row">
            <span class="label">Required Amount:</span>
            <span class="value">₹ ${payment_amount || '0'}</span>
          </div>
        </div>

        <form method="POST" action="/process-deposit">
          <label style="display: block; margin-bottom: 10px; color: #666; font-weight: bold;">Deposit Amount (₹):</label>
          <input type="number" name="deposit_amount" step="0.01" min="1" value="${amount || ''}" required placeholder="Enter amount">
          
          <input type="hidden" name="student_id" value="${student_id || ''}">
          <input type="hidden" name="semester" value="${semester || ''}">
          <input type="hidden" name="payment_amount" value="${payment_amount || ''}">
          
          <button type="submit">✅ Confirm Deposit</button>
          <button type="button" class="cancel-btn" onclick="history.back()">❌ Cancel</button>
        </form>
      </div>
    </body>
    </html>
  `);
});

app.post('/process-deposit', async (req, res) => {
  const { deposit_amount, student_id, semester, payment_amount } = req.body;

  try {
    if (!req.session.user) {
      return res.status(401).send("Not logged in");
    }

    const depositAmount = parseFloat(deposit_amount);
    if (isNaN(depositAmount) || depositAmount <= 0) {
      return res.status(400).send("Invalid deposit amount");
    }

    const { account_id, customer_id } = req.session.user;

    // Update account balance
    const result = await bankDB.query(
      `UPDATE Accounts SET balance = balance + $1 WHERE account_id = $2 AND customer_id = $3 RETURNING balance`,
      [depositAmount, account_id, customer_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).send("Account not found");
    }

    const newBalance = result.rows[0].balance;

    // Record deposit transaction
    await bankDB.query(
      `INSERT INTO Transactions (account_id, transaction_type, amount, status) 
       VALUES ($1, $2, $3, $4)`,
      [account_id, 'credit', depositAmount, 'success']
    );

    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Deposit Successful</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial; background: linear-gradient(135deg, #28a745 0%, #1e7e34 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center; }
          .modal { background: white; padding: 50px 40px; border-radius: 15px; max-width: 450px; width: 90%; box-shadow: 0 10px 40px rgba(0,0,0,0.3); text-align: center; }
          .icon { font-size: 60px; margin-bottom: 20px; }
          h2 { color: #28a745; margin-bottom: 15px; font-size: 28px; }
          p { color: #666; margin: 10px 0; }
          .info-box { background: #f0f0f0; border-left: 4px solid #28a745; padding: 15px; margin: 15px 0; text-align: left; text-align: center; }
          .label { color: #666; font-size: 14px; }
          .value { color: #28a745; font-weight: bold; font-size: 20px; }
          button { width: 100%; padding: 15px; background: #0066cc; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 18px; font-weight: bold; margin-top: 30px; }
          button:hover { background: #0052a3; }
        </style>
      </head>
      <body>
        <div class="modal">
          <div class="icon">✅</div>
          <h2>Deposit Successful!</h2>
          <p>Funds have been deposited to your account.</p>
          
          <div class="info-box">
            <div class="label">Deposited Amount</div>
            <div class="value">+ ₹ ${depositAmount.toLocaleString('en-IN')}</div>
          </div>
          <div class="info-box">
            <div class="label">Current Balance</div>
            <div class="value">₹ ${newBalance.toLocaleString('en-IN')}</div>
          </div>

          ${student_id && semester && payment_amount ? `
            <script>
              setTimeout(() => {
                const form = document.createElement('form');
                form.method = 'POST';
                form.action = '/process-payment';
                
                const fields = {
                  student_id: '${student_id}',
                  semester: '${semester}',
                  amount: '${payment_amount}'
                };
                
                for (let key in fields) {
                  const input = document.createElement('input');
                  input.type = 'hidden';
                  input.name = key;
                  input.value = fields[key];
                  form.appendChild(input);
                }
                
                document.body.appendChild(form);
                form.submit();
              }, 2000);
            </script>
            <p style="color: #0066cc; font-weight: bold; margin-top: 20px;">Redirecting to payment...</p>
          ` : `
            <button onclick="window.location.href='/login'">Back to Dashboard</button>
          `}
        </div>
      </body>
      </html>
    `);

  } catch (err) {
    console.error(err);
    res.status(500).send(`Deposit failed: ${err.message}`);
  }
});

app.get('/withdraw', (req, res) => {
  const { amount } = req.query;

  if (!req.session.user) {
    return res.redirect('/login');
  }

  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Withdraw Funds</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial; background: linear-gradient(135deg, #0066cc 0%, #0052a3 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; }
        .container { background: white; padding: 40px; border-radius: 15px; max-width: 500px; width: 100%; box-shadow: 0 10px 40px rgba(0,0,0,0.3); }
        h1 { color: #0066cc; text-align: center; margin-bottom: 30px; }
        input { width: 100%; padding: 12px; margin: 15px 0; border: 2px solid #0066cc; border-radius: 5px; box-sizing: border-box; font-size: 16px; }
        button { width: 100%; padding: 12px; background: #0066cc; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; font-weight: bold; margin-top: 20px; }
        button:hover { background: #0052a3; }
        .cancel-btn { background: #6c757d; margin-top: 10px; }
        .cancel-btn:hover { background: #5a6268; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🏧 Withdraw Funds</h1>

        <form method="POST" action="/process-withdraw">
          <label style="display: block; margin-bottom: 10px; color: #666; font-weight: bold;">Withdraw Amount (₹):</label>
          <input type="number" name="withdraw_amount" step="0.01" min="1" value="${amount || ''}" required placeholder="Enter amount">
          
          <button type="submit">✅ Confirm Withdrawal</button>
          <button type="button" class="cancel-btn" onclick="history.back()">❌ Cancel</button>
        </form>
      </div>
    </body>
    </html>
  `);
});

app.post('/process-withdraw', async (req, res) => {
  const { withdraw_amount } = req.body;

  try {
    if (!req.session.user) {
      return res.status(401).send("Not logged in");
    }

    const withdrawAmount = parseFloat(withdraw_amount);
    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      return res.status(400).send("Invalid withdrawal amount");
    }

    const { account_id, customer_id } = req.session.user;

    // Check balance
    const checkResult = await bankDB.query(
      `SELECT balance FROM Accounts WHERE account_id = $1 AND customer_id = $2`,
      [account_id, customer_id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).send("Account not found");
    }

    if (checkResult.rows[0].balance < withdrawAmount) {
      return res.status(400).send("Insufficient balance for withdrawal");
    }

    // Update account balance
    const result = await bankDB.query(
      `UPDATE Accounts SET balance = balance - $1 WHERE account_id = $2 AND customer_id = $3 RETURNING balance`,
      [withdrawAmount, account_id, customer_id]
    );

    const newBalance = result.rows[0].balance;

    // Record withdrawal transaction
    await bankDB.query(
      `INSERT INTO Transactions (account_id, transaction_type, amount, status) 
       VALUES ($1, $2, $3, $4)`,
      [account_id, 'debit', withdrawAmount, 'success']
    );

    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Withdrawal Successful</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial; background: linear-gradient(135deg, #0066cc 0%, #0052a3 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center; }
          .modal { background: white; padding: 50px 40px; border-radius: 15px; max-width: 450px; width: 90%; box-shadow: 0 10px 40px rgba(0,0,0,0.3); text-align: center; }
          .icon { font-size: 60px; margin-bottom: 20px; }
          h2 { color: #0066cc; margin-bottom: 15px; font-size: 28px; }
          p { color: #666; margin: 10px 0; }
          .info-box { background: #f0f0f0; border-left: 4px solid #dc3545; padding: 15px; margin: 15px 0; text-align: center; }
          .label { color: #666; font-size: 14px; }
          .value { color: #0066cc; font-weight: bold; font-size: 20px; }
          button { width: 100%; padding: 15px; background: #0066cc; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 18px; font-weight: bold; margin-top: 30px; }
          button:hover { background: #0052a3; }
        </style>
      </head>
      <body>
        <div class="modal">
          <div class="icon">✅</div>
          <h2>Withdrawal Successful!</h2>
          <p>Cash has been withdrawn from your account.</p>
          
          <div class="info-box">
            <div class="label">Withdrawn Amount</div>
            <div class="value">- ₹ ${withdrawAmount.toLocaleString('en-IN')}</div>
          </div>
          <div class="info-box">
            <div class="label">Remaining Balance</div>
            <div class="value">₹ ${newBalance.toLocaleString('en-IN')}</div>
          </div>

          <button onclick="window.location.href='/login'">Back to Dashboard</button>
        </div>
      </body>
      </html>
    `);

  } catch (err) {
    console.error(err);
    res.status(500).send(`Withdrawal failed: ${err.message}`);
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send("Logout failed");
    }
    res.redirect('/login');
  });
});

app.listen(4000, () => {
  console.log("Bank server running on port 4000 🚀");
});