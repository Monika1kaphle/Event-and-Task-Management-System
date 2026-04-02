require('dotenv').config();
require('express-async-errors'); 

const express = require('express');
const cors = require('cors');
const path = require('path');

const adminRoutes = require('./routes/admin'); 
const eventRoutes = require('./routes/eventRoutes');
const authRoutes = require('./routes/auth');
const clientRoutes = require('./routes/clientRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const userRoutes = require('./routes/users'); // ✅ ADD THIS
const taskRoutes = require('./routes/taskRoutes')
const notificationRoutes = require('./routes/notificationRoutes')


const app = express();

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/admin', adminRoutes); 
app.use('/api/events', eventRoutes); 
app.use('/api/auth', authRoutes);
app.use('/api/client', clientRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/notifications', notificationRoutes);

// Error Handling
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

const port = process.env.PORT || 3000; 
app.listen(port, () => console.log(`✅ Server listening on port ${port}`));