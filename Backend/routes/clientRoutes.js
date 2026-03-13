const express = require('express');
const router = express.Router();
const { loginRequired } = require('../middleware/auth');
const Booking = require('../models/booking');
const db = require('../config/db');

// 1. Get current user's dashboard data
router.get('/dashboard', loginRequired, async (req, res) => {
    try {
        const myEvents = await Booking.getUserBookings(req.user.id);
        res.json({ user: req.user, myEvents: myEvents });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
});

// 2. Book an event
router.post('/book-event', loginRequired, async (req, res) => {
    const { eventId } = req.body;
    if (!eventId) return res.status(400).json({ error: 'Event ID required' });
    try {
        await Booking.createBooking(req.user.id, eventId);
        res.json({ message: "Booking successful!" });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// 3. Dashboard stats
router.get('/dashboard-stats', loginRequired, async (req, res) => {
    const userId = req.user.id;
    try {
        const [rows] = await db.query(
            `SELECT 
              (SELECT COUNT(*) FROM bookings WHERE user_id = ? AND booking_date >= NOW()) AS activeBookings,
              (SELECT COUNT(*) FROM bookings WHERE user_id = ? AND booking_date < NOW()) AS attendedEvents`,
            [userId, userId]
        );
        res.json(rows[0] || { activeBookings: 0, attendedEvents: 0 });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// 4. Get all events
router.get('/events', loginRequired, async (req, res) => {
    try {
        const [events] = await db.query(
            `SELECT e.*, 
                CASE WHEN b.id IS NOT NULL THEN true ELSE false END AS isBooked
             FROM events e
             LEFT JOIN bookings b ON b.event_id = e.id AND b.user_id = ?
             ORDER BY e.event_date ASC`,
            [req.user.id]
        );
        res.json(events);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch events' });
    }
});

// ✅ module.exports must always be the LAST line
module.exports = router;