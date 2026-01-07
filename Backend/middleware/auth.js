const jwt = require('jsonwebtoken');
const User = require('../models/user');

async function loginRequired(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Authorization required' });
  const token = auth.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = { id: payload.id, role: payload.role };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// optional: attach full user record
async function attachUser(req, res, next) {
  if (!req.user) return next();
  const user = await User.findById(req.user.id);
  if (!user) return res.status(401).json({ error: 'User not found' });
  req.user = { id: user.id, role: user.role, email: user.email, name: user.name };
  next();
}

module.exports = { loginRequired, attachUser };
