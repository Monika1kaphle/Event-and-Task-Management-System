const jwt = require('jsonwebtoken');
const User = require('../models/user');
const OTP = require('../models/otp');

function signToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '12h' }
  );
}

// POST /api/auth/verify-otp
async function verifyOTP(req, res) {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ error: 'Email and OTP required' });
  }

  const isValid = await OTP.verifyOTP(email, otp);
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid or expired OTP' });
  }

  // Find user
  let user = await User.findByEmail(email);

  // Auto-register if user does not exist (optional, nice UX)
  if (!user) {
    user = await User.createUser({
      name: email.split('@')[0],
      email,
      password: 'OTP_LOGIN', // dummy
      role: 'CLIENT'
    });
  }

  const token = signToken(user);

  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role
    }
  });
}

module.exports = { verifyOTP };
