const pool = require('../config/db');

async function createEvent({ title, event_date, event_time, description }) {
  const [result] = await pool.query(
    'INSERT INTO events (title, event_date, event_time, description) VALUES (?, ?, ?, ?)',
    [title, event_date, event_time, description]
  );
  return { id: result.insertId, title, event_date };
}

async function getAllEvents() {
  const [rows] = await pool.query('SELECT * FROM events ORDER BY event_date ASC');
  return rows;
}

module.exports = { createEvent, getAllEvents };