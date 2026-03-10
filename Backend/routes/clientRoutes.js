const express = require('express');
const router = express.Router();
const { loginRequired } = require('../middleware/auth');
const Booking = require('../models/booking'); // Import the model

// 1. Get current user's dashboard data
router.get('/dashboard', loginRequired, async (req, res) => {
    try {
        const myEvents = await Booking.getUserBookings(req.user.id);
        res.json({ 
            user: req.user, 
            myEvents: myEvents 
        });
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

module.exports = router;