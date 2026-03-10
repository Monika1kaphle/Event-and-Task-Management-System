const pool = require('../config/db');

async function getUserBookings(userId) {
    const [rows] = await pool.query(
        `SELECT e.*, b.booking_date 
         FROM events e 
         JOIN bookings b ON e.id = b.event_id 
         WHERE b.user_id = ?`, 
        [userId]
    );
    return rows;
}

async function createBooking(userId, eventId) {
    // Check if the user has already booked this event
    const [existing] = await pool.query(
        'SELECT * FROM bookings WHERE user_id = ? AND event_id = ?',
        [userId, eventId]
    );

    if (existing.length > 0) {
        throw new Error('You have already booked this event.');
    }

    const [result] = await pool.query(
        'INSERT INTO bookings (user_id, event_id, booking_date) VALUES (?, ?, NOW())',
        [userId, eventId]
    );
    return result;
}

module.exports = {
    getUserBookings,
    createBooking
};