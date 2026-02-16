const pool = require('../config/db');

async function assignTask({ title, department_id, assigned_to, deadline }) {
  const [result] = await pool.query(
    'INSERT INTO tasks (title, department_id, assigned_to, deadline, status) VALUES (?, ?, ?, ?, ?)',
    [title, department_id, assigned_to, deadline, 'PENDING']
  );
  return { id: result.insertId, title };
}

module.exports = { assignTask };