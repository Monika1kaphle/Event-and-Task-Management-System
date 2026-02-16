require('dotenv').config();
require('express-async-errors'); // Ensure you ran: npm install express-async-errors

const express = require('express');
const cors = require('cors');

// Import Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin'); // Matches the file Backend/routes/admin.js

const app = express();

// --- MIDDLEWARE ---
// Place CORS at the very top
app.use(cors({
  origin: 'http://localhost:5173', // Matches your Vite Frontend
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));

app.use(express.json());

// --- ROUTES ---
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes); // This connects the admin routes

// --- ERROR HANDLER ---
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

// --- START SERVER ---
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`✅ Server listening on port ${port}`);
});