const pool = require('../config/db');

async function createUser({ name, email, password, role = 'CLIENT', status = 'active', department_id = null, role_title = null }) {
  const [result] = await pool.query(
    'INSERT INTO users (name, email, password, role, status, department_id, role_title) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [name, email, password || null, role, status, department_id, role_title]
  );
  return { id: result.insertId,name, email, role, status };
}

async function createMember({ name, email, department_id, role_title }) {
  const [result] = await pool.query(
    'INSERT INTO users (name, email, role, status, department_id, role_title) VALUES (?, ?, ?, ?, ?, ?)',
    [name, email, 'MEMBER', 'active', department_id, role_title]
  );
  return { id: result.insertId, name, email, department_id, role_title };
}

async function findByEmail(email) {
  const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0];
}

async function findById(id) {
  const [rows] = await pool.query(
    'SELECT id, name, email, role, status, department_id, role_title, created_at FROM users WHERE id = ?',
    [id]
  );
  return rows[0];
}

// Fixed: Returns both Members and Dept Heads for the department
async function getMembersByDepartment(department_id) {
  const [rows] = await pool.query(
    'SELECT id, name, email, role, status, role_title, department_id, created_at FROM users WHERE department_id = ?',
    [department_id]
  );
  return rows;
}

async function getAllUsers() {
  const [rows] = await pool.query(
    'SELECT id, name, email, role, status, department_id, role_title, created_at FROM users'
  );
  return rows;
}

async function updateUser(id, fields) {
  const allowed = ['name', 'email', 'password', 'role', 'status', 'department_id', 'role_title'];
  const setClauses = [];
  const values = [];
  for (const key of allowed) {
    if (fields[key] !== undefined) {
      setClauses.push(`${key} = ?`);
      values.push(fields[key]);
    }
  }
  if (setClauses.length === 0) return findById(id);
  values.push(id);
  await pool.query(`UPDATE users SET ${setClauses.join(', ')} WHERE id = ?`, values);
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
  await pool.query('UPDATE users SET login_attempts = 0, lock_until = NULL WHERE id = ?', [id]);
}

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

// ─── PASSWORD RESET ───

async function savePasswordResetToken(email, resetToken) {
  const expiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour expiry
  await pool.query(
    'UPDATE users SET password_reset_token = ?, reset_token_expires = ? WHERE email = ?',
    [resetToken, expiresAt, email]
  );
}

async function verifyPasswordResetToken(email, resetToken) {
  const [rows] = await pool.query(
    'SELECT * FROM users WHERE email = ? AND password_reset_token = ? AND reset_token_expires > NOW()',
    [email, resetToken]
  );
  return rows.length > 0 ? rows[0] : null;
}

async function clearPasswordResetToken(userId) {
  await pool.query(
    'UPDATE users SET password_reset_token = NULL, reset_token_expires = NULL WHERE id = ?',
    [userId]
  );
}

module.exports = {
  createUser, 
  createMember,
  findByEmail, 
  findById, 
  getAllUsers,
  getMembersByDepartment,
  updateUser, 
  deactivateUser, 
  incrementLoginAttempts,
  resetLoginAttempts, 
  saveOTP, 
  verifyOTP,
  savePasswordResetToken,
  verifyPasswordResetToken,
  clearPasswordResetToken
};