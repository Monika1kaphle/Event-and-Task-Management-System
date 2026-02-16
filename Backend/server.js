require('dotenv').config();
require('express-async-errors'); 

const express = require('express');
const cors = require('cors');

// Import Routes
const authRoutes = require('./routes/auth'); // Make sure these files exist
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin'); 

const app = express();

// --- MIDDLEWARE ---
app.use(cors({
  origin: 'http://localhost:5173', // Your Vite Frontend URL
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));

app.use(express.json());

// --- ROUTES ---
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// This line connects your Admin Logic (Add Dept, Fetch Users)
app.use('/api/admin', adminRoutes); 

// --- ERROR HANDLER ---
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

// --- START SERVER ---
// Changed to 3000 to match your Frontend fetch calls
const port = process.env.PORT || 3000; 
app.listen(port, () => {
  console.log(`✅ Server listening on port ${port}`);
});