const pool = require('../config/db');

async function createDepartment(name, head_id, event_id = null) {
  const [result] = await pool.query(
    'INSERT INTO departments (name, head_id, event_id) VALUES (?, ?, ?)',
    [name, head_id, event_id || null]
  );
  return { id: result.insertId, name, event_id };
}

async function getAllDepartments() {
  // Return all departments
  const [rows] = await pool.query('SELECT * FROM departments');
  return rows;
}

async function getDepartmentsByEvent(event_id) {
  const [rows] = await pool.query('SELECT * FROM departments WHERE event_id = ?', [event_id]);
  return rows;
}

async function getDepartmentProgress() {
  const sql = `
    SELECT 
      d.name as department_name,
      d.event_id,
      COUNT(t.id) as total_tasks,
      SUM(CASE WHEN t.status = 'COMPLETED' THEN 1 ELSE 0 END) as completed_tasks
    FROM departments d
    LEFT JOIN tasks t ON d.id = t.department_id
    GROUP BY d.id
  `;
  const [rows] = await pool.query(sql);
  return rows.map(row => ({
    name: row.department_name,
    event_id: row.event_id,
    percentage: row.total_tasks > 0 ? Math.round((row.completed_tasks / row.total_tasks) * 100) : 0
  }));
}

async function updateDepartment(id, name) {
  const [result] = await pool.query(
    'UPDATE departments SET name = ? WHERE id = ?',
    [name, id]
  );
  if (result.affectedRows === 0) throw new Error('Department not found');
  const [rows] = await pool.query('SELECT * FROM departments WHERE id = ?', [id]);
  return rows[0];
}

async function deleteDepartment(id) {
  const [result] = await pool.query('DELETE FROM departments WHERE id = ?', [id]);
  if (result.affectedRows === 0) throw new Error('Department not found');
  return { message: 'Department deleted successfully' };
}

module.exports = { createDepartment, getAllDepartments, getDepartmentsByEvent, getDepartmentProgress, updateDepartment, deleteDepartment };