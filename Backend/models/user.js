const pool = require('../config/db');

// --- DATABASE FUNCTIONS ---

async function createUser({ name, email, password, role = 'CLIENT', status = 'active' }) {
  const conn = await pool.getConnection();
  try {
    const [result] = await conn.query(
      'INSERT INTO users (name, email, password, role, status) VALUES (?, ?, ?, ?, ?)',
      [name, email, password, role, status]
    );
    return { id: result.insertId, name, email, role, status };
  } finally {
    conn.release();
  }
}

async function findByEmail(email) {
  const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0];
}

async function findById(id) {
  const [rows] = await pool.query('SELECT id, name, email, role, status, created_at FROM users WHERE id = ?', [id]);
  return rows[0];
}

async function getAllUsers() {
  const [rows] = await pool.query('SELECT id, name, email, role, status, created_at FROM users');
  return rows;
}

async function updateUser(id, { name, email, password, role, status }) {
  const fields = [];
  const values = [];
  if (name) { fields.push('name = ?'); values.push(name); }
  if (email) { fields.push('email = ?'); values.push(email); }
  if (password) { fields.push('password = ?'); values.push(password); }
  if (role) { fields.push('role = ?'); values.push(role); }
  if (status) { fields.push('status = ?'); values.push(status); }
  if (fields.length === 0) return findById(id);

  values.push(id);
  const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
  await pool.query(sql, values);
  return findById(id);
}

async function deactivateUser(id) {
  await pool.query('UPDATE users SET status = ? WHERE id = ?', ['inactive', id]);
  return findById(id);
}

async function incrementLoginAttempts(id) {
  await pool.query(
    `UPDATE users
     SET login_attempts = login_attempts + 1,
         lock_until = IF(login_attempts + 1 >= 3, DATE_ADD(NOW(), INTERVAL 15 MINUTE), lock_until)
     WHERE id = ?`,
    [id]
  );
}

async function resetLoginAttempts(id) {
  await pool.query(
    'UPDATE users SET login_attempts = 0, lock_until = NULL WHERE id = ?',
    [id]
  );
}

// --- OTP FUNCTIONS ---

async function saveOTP(email, otpCode) {
  await pool.query('DELETE FROM otps WHERE email = ?', [email]);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
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
    await pool.query('DELETE FROM otps WHERE id = ?', [rows[0].id]);
    return true;
  }
  return false;
}

module.exports = {
  createUser,
  findByEmail,
  findById,
  getAllUsers,
  updateUser,
  deactivateUser,
  incrementLoginAttempts,
  resetLoginAttempts,
  saveOTP,
  verifyOTP
};