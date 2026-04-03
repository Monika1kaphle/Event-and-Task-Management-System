const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { sendOTPEmail, sendLoginOTPEmail } = require('../services/emailService');

/**
 * 1. POST /api/auth/send-otp
 *
 * Branches by role + status:
 *   - not found                         → 404
 *   - 'Pending OTP' (any role)          → OTP already sent by Admin; show OTP input
 *   - 'active' CLIENT                   → generate & send a fresh OTP (original OTP login)
 *   - 'active' ADMIN/DEPT_HEAD/MEMBER   → redirect to password step
 */
router.post('/send-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  try {
    const user = await User.findByEmail(email);

    // ── No account found ──
    if (!user) {
      return res.status(404).json({ error: 'No account found with this email.' });
    }

    // ── Pending OTP (dept head / member invited by Admin): OTP already in their inbox ──
    if (user.status === 'pending_otp') {
      return res.json({ message: 'OTP sent. Please enter the code from your invitation email.' });
    }

    // ── Active CLIENT: generate & send a fresh OTP (original OTP-based login) ──
    if (user.status === 'active' && user.role === 'CLIENT') {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      await User.saveOTP(email, otp);
      console.log(`[OTP] ${email}: ${otp}`);
      await sendLoginOTPEmail(email, otp);
      return res.json({ message: 'OTP sent to your email.' });
    }

    // ── Active ADMIN / DEPT_HEAD / MEMBER: use password login ──
    if (user.status === 'active') {
      return res.status(400).json({
        error: 'This account is already active. Please login with your password.'
      });
    }

    // Fallback for any unrecognised status
    return res.status(400).json({ error: 'Unable to process login. Please contact support.' });
  } catch (err) {
    console.error('send-otp error:', err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

/**
 * 2. POST /api/auth/verify-otp
 *
 * Branches by user status:
 *   - 'Pending OTP' (dept head / member invited by admin)
 *       → OTP verified → issue a tempToken → frontend redirects to /set-password
 *   - 'active' (regular user who got a fresh OTP)
 *       → OTP verified → issue a full session token → frontend logs them in directly
 */
router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ error: 'Email and OTP required' });
  }

  try {
    const user = await User.findByEmail(email);
    if (!user) return res.status(404).json({ error: 'No account found.' });

    const valid = await User.verifyOTP(email, otp);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid or expired OTP.' });
    }

    // ── Dept head / member invited by admin: must set password first ──
    if (user.status === 'pending_otp') {
      const tempToken = jwt.sign(
        { id: user.id, email: user.email, step: 'set-password' },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
      );
      return res.json({
        message: 'OTP verified. Please set your password.',
        tempToken,
        user: { id: user.id, email: user.email, status: user.status, role: user.role, department_id: user.department_id || null }
      });
    }

    // ── Active user (regular OTP login): issue a full session token ──
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, department_id: user.department_id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    return res.json({
      message: 'OTP verified successfully',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, status: user.status, department_id: user.department_id || null }
    });
  } catch (err) {
    console.error('verify-otp error:', err);
    res.status(500).json({ error: 'Verification failed.' });
  }
});

/**
 * 3. POST /api/auth/set-password
 * Receives the new password, hashes it, and activates the account
 */
router.post('/set-password', async (req, res) => {
  const { tempToken, password } = req.body;

  if (!tempToken || !password) {
    return res.status(400).json({ error: 'Token and password required' });
  }

  try {
    // Verify the temporary token
    const decoded = jwt.verify(tempToken, process.env.JWT_SECRET);

    // Security check: Ensure this token was meant for setting password
    if (decoded.step !== 'set-password') {
      return res.status(401).json({ error: 'Invalid token step.' });
    }

    // Hash the new password
    const hashed = await bcrypt.hash(password, 10);

    // Save password and update status to 'active'
    await User.updateUser(decoded.id, { 
      password: hashed, 
      status: 'active' 
    });

    res.json({ message: 'Password set successfully. You can now login.' });
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Session expired. Please verify your OTP again.' });
    }
    console.error('set-password error:', err);
    res.status(500).json({ error: 'Failed to set password.' });
  }
});


// POST /api/auth/login — password-based login for admin, dept head, member, client
router.post('/login', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' })
  }
  try {
    const user = await User.findByEmail(email)
    if (!user) return res.status(404).json({ error: 'No account found with this email.' })

    if (user.status !== 'active') {
      return res.status(400).json({ error: 'Account not yet activated. Please verify your OTP first.' })
    }

    const match = await bcrypt.compare(password, user.password)
    if (!match) return res.status(401).json({ error: 'Incorrect password.' })

    // Reset login attempts on success
    await User.resetLoginAttempts(user.id)

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, department_id: user.department_id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        department_id: user.department_id || null
      }
    })
  } catch (err) {
    console.error('login error:', err)
    res.status(500).json({ error: 'Login failed.' })
  }
})
module.exports = router;