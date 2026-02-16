const pool = require('../config/db');

async function saveOTP(email, otpCode) {
  // 1. Delete any previous OTPs for this email (clean up)
  await pool.query('DELETE FROM otps WHERE email = ?', [email]);

  // 2. Set expiration to 10 minutes from now
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  // 3. Insert new OTP
  await pool.query(
    'INSERT INTO otps (email, otp_code, expires_at) VALUES (?, ?, ?)',
    [email, otpCode, expiresAt]
  );
}

async function verifyOTP(email, otpCode) {
  const [rows] = await pool.query(
    'SELECT * FROM otps WHERE email = ? AND otp_code = ? AND expires_at > NOW()',
    [email, otpCode]
  );

  if (rows.length > 0) {
    // OTP found and valid! Delete it so it cannot be used again.
    await pool.query('DELETE FROM otps WHERE id = ?', [rows[0].id]);
    return true;
  }
  return false;
}

module.exports = { saveOTP, verifyOTP };