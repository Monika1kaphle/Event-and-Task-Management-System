const bcrypt = require('bcrypt');
const User = require('../models/user');

async function createUser(req, res) {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) return res.status(400).json({ error: 'All fields required' });

  const existing = await User.findByEmail(email);
  if (existing) return res.status(409).json({ error: 'Email already exists' });

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.createUser({ name, email, password: hashed, role, status: 'active' });
  res.status(201).json(user);
}

async function listUsers(req, res) {
  const users = await User.getAllUsers();
  res.json(users);
}

async function getUser(req, res) {
  const id = parseInt(req.params.id, 10);
  if (req.user.role !== 'ADMIN' && req.user.id !== id) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  const user = await User.findById(id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
}

async function updateUser(req, res) {
  const id = parseInt(req.params.id, 10);
  if (req.user.role !== 'ADMIN' && req.user.id !== id) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const payload = {};
  if (req.body.name) payload.name = req.body.name;
  if (req.body.email) payload.email = req.body.email;
  if (req.body.password) payload.password = await bcrypt.hash(req.body.password, 10);
  
  // Update logic here...
  await User.updateUser(id, payload); // Simplified for safety
  
  const updated = await User.findById(id);
  res.json(updated);
}

async function deleteUser(req, res) {
    // Placeholder if you don't have delete logic yet
    res.status(501).json({message: "Delete not implemented yet"});
}

// IMPORTANT: This export list must match what routes/users.js expects
module.exports = { 
    createUser, 
    listUsers, 
    getUser, 
    updateUser,
    deleteUser 
};