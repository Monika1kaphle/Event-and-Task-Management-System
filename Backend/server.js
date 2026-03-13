require('dotenv').config();
require('express-async-errors'); 

const express = require('express');
const cors = require('cors');
const path = require('path');
const adminRoutes = require('./routes/admin'); 
const eventRoutes = require('./routes/eventRoutes'); // Your new file
const authRoutes = require('./routes/auth');
const clientRoutes = require('./routes/clientRoutes'); // Add this line

const app = express();

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- ROUTES ---
// Admin routes (e.g., users, departments)
app.use('/api/admin', adminRoutes); 

// Event routes (e.g., get, post) - Mapped here
app.use('/api/events', eventRoutes); 

app.use('/api/auth', authRoutes);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/client', clientRoutes);

// --- CENTRALIZED VALIDATION ---
app.post('/api/admin/validate-event-date', (req, res) => { /* ... your logic ... */ });

// Error Handling
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

const port = process.env.PORT || 3000; 
app.listen(port, () => console.log(`✅ Server listening on port ${port}`));