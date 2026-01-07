require('dotenv').config();
require('express-async-errors');
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Basic error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
