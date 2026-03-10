const pool = require('../config/db');

async function createEvent({ title, event_date, event_time, description, poster_url, price, location, max_capacity }) {
  if (!event_date || !event_time) {
    throw new Error("Date and Time are required.");
  }

  const [result] = await pool.query(
    'INSERT INTO events (title, event_date, event_time, description, poster_url, price, location, max_capacity) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [title, event_date, event_time, description, poster_url, price || 0, location || '', max_capacity || null]
  );
  return { id: result.insertId, title };
}

async function getAllEvents() {
  const [rows] = await pool.query('SELECT * FROM events ORDER BY event_date ASC');
  return rows;
}

module.exports = { createEvent, getAllEvents };