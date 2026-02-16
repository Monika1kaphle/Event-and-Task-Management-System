const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const nodemailer = require('nodemailer'); // Ensure you ran: npm install nodemailer

// Configure Email (Replace with real credentials later)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-app-password'
  }
});

function signToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role },
     process.env.JWT_SECRET,
    {expiresIn: '12h'}
  );
}

async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ error: 'Email and password required' });

  const user = await User.findByEmail(email);
  if (!user)
    return res.status(401).json({ error: 'Invalid credentials' });

  if (user.status !== 'active')
    return res.status(403).json({ error: 'Account inactive' });

  if (user.lock_until && new Date(user.lock_until) > new Date()) {
    return res.status(403).json({
      error: 'Account locked. Try again later.'
    });
  }

  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    await User.incrementLoginAttempts(user.id);
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Successful login
  await User.resetLoginAttempts(user.id);
  const token = signToken(user);

  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role }
  });
}

async function registerClient(req, res) {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Name, email and password required' });

  const existing = await User.findByEmail(email);
  if (existing) return res.status(409).json({ error: 'Email already registered' });

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.createUser({ name, email, password: hashed, role: 'CLIENT' });
  const token = signToken(user);
  res.status(201).json({ token, user });
}

// --- NEW FUNCTIONS ---

async function sendOtp(req, res) {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  // 1. Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    // 2. Save to DB
    await User.saveOTP(email, otp);

    // 3. Log to console for testing
    console.log(`[TESTING] OTP for ${email}: ${otp}`);

    // 4. Send Email (Uncomment when ready)
    /*
    await transporter.sendMail({
      from: 'your-email@gmail.com',
      to: email,
      subject: 'Your Verification Code',
      text: `Your OTP is: ${otp}`
    });
    */

    res.json({ message: 'OTP sent' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
}

async function verifyOtp(req, res) {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ error: 'Email and OTP required' });
  }

  const isValid = await User.verifyOTP(email, otp);
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid or expired OTP' });
  }

  // 🔹 Find existing user
  let user = await User.findByEmail(email);

  // 🔹 Auto-create user if not exists (OTP-first login UX)
  if (!user) {
    user = await User.createUser({
      name: email.split('@')[0],
      email,
      password: 'OTP_LOGIN',
      role: 'CLIENT'
    });
  }

  // 🔹 ISSUE JWT (THIS WAS MISSING)
  const token = signToken(user);

  return res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role
    }
  });
}


module.exports = { login, registerClient, sendOtp, verifyOtp };