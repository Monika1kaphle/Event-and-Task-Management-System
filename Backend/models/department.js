const pool = require('../config/db');

async function createDepartment(name, head_id) {
  const [result] = await pool.query(
    'INSERT INTO departments (name, head_id) VALUES (?, ?)',
    [name, head_id]
  );
  return { id: result.insertId, name };
}

async function getAllDepartments() {
  const [rows] = await pool.query('SELECT * FROM departments');
  return rows;
}

// This calculates the % progress seen on your dashboard
async function getDepartmentProgress() {
  const sql = `
    SELECT 
      d.name as department_name,
      COUNT(t.id) as total_tasks,
      SUM(CASE WHEN t.status = 'COMPLETED' THEN 1 ELSE 0 END) as completed_tasks
    FROM departments d
    LEFT JOIN tasks t ON d.id = t.department_id
    GROUP BY d.id
  `;
  const [rows] = await pool.query(sql);
  
  // Calculate percentage in Javascript to be safe
  return rows.map(row => ({
    name: row.department_name,
    percentage: row.total_tasks > 0 ? Math.round((row.completed_tasks / row.total_tasks) * 100) : 0
  }));
}

module.exports = { createDepartment, getAllDepartments, getDepartmentProgress };