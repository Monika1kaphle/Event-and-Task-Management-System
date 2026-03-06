const pool = require('../config/db');

async function createEvent({ title, event_date, event_time, description, poster_url }) {
  // Simple check to ensure date isn't empty
  if (!event_date || !event_time) {
    throw new Error("Date and Time are required.");
  }

  const [result] = await pool.query(
    'INSERT INTO events (title, event_date, event_time, description, poster_url) VALUES (?, ?, ?, ?, ?)',
    [title, event_date, event_time, description, poster_url]
  );
  return { id: result.insertId, title };
}

async function getAllEvents() {
  const [rows] = await pool.query('SELECT * FROM events ORDER BY event_date ASC');
  return rows;
}

module.exports = { createEvent, getAllEvents };