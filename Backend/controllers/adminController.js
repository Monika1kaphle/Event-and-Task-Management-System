const bcrypt = require('bcrypt');
const User = require('../models/user');
const db = require('../config/db');
const { sendOTPEmail } = require('../services/emailService');

// ── DASHBOARD FUNCTIONS ──

async function getDashboardData(req, res) {
  try {
    const [[userCount]]  = await db.query('SELECT COUNT(*) as count FROM users')
    const [[eventCount]] = await db.query('SELECT COUNT(*) as count FROM events')
    const [[deptCount]]  = await db.query('SELECT COUNT(*) as count FROM departments')
    const [[taskCount]]  = await db.query('SELECT COUNT(*) as count FROM tasks')
    res.json({
      totalUsers:       userCount.count,
      totalEvents:      eventCount.count,
      totalDepartments: deptCount.count,
      totalTasks:       taskCount.count,
    })
  } catch (err) {
    console.error('getDashboardData error:', err)
    res.status(500).json({ error: 'Failed to fetch dashboard data' })
  }
}

async function getUsers(req, res) {
  try {
    const [rows] = await db.query(
      'SELECT id, name, email, role, status, department_id, role_title, created_at FROM users'
    )
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' })
  }
}

async function getDepartments(req, res) {
  try {
    const [rows] = await db.query('SELECT * FROM departments WHERE event_id IS NULL')
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch departments' })
  }
}

async function addDepartment(req, res) {
  const { name, head_id } = req.body
  if (!name) return res.status(400).json({ error: 'Department name required' })
  try {
    const [result] = await db.query(
      'INSERT INTO departments (name, head_id) VALUES (?, ?)',
      [name, head_id || null]
    )
    
    // Send notification to department head if assigned
    if (head_id) {
      try {
        const [[headUser]] = await db.query('SELECT name, email FROM users WHERE id = ?', [head_id])
        if (headUser) {
          // Create in-app notification
          await db.query(
            'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)',
            [
              head_id,
              'Department Head Assignment',
              `You have been assigned as the head of the "${name}" department.`,
              'DEPT_HEAD_ASSIGNED'
            ]
          )
        }
      } catch (notifErr) {
        console.error('Notification error:', notifErr.message)
        // Continue even if notification fails
      }
    }
    
    res.status(201).json({ id: result.insertId, name, head_id: head_id || null })
  } catch (err) {
    res.status(500).json({ error: 'Failed to add department' })
  }
}

async function assignTask(req, res) {
  const { title, description, department_id, assigned_to, due_date } = req.body
  if (!title || !department_id) {
    return res.status(400).json({ error: 'Title and department are required' })
  }
  try {
    const [result] = await db.query(
      `INSERT INTO tasks (title, description, department_id, assigned_to, due_date, status)
       VALUES (?, ?, ?, ?, ?, 'PENDING')`,
      [title, description || null, department_id, assigned_to || null, due_date || null]
    )
    res.status(201).json({ id: result.insertId, title })
  } catch (err) {
    res.status(500).json({ error: 'Failed to assign task' })
  }
}

// ── EVENT FUNCTIONS ──

async function getEvents(req, res) {
  try {
    const [rows] = await db.query('SELECT * FROM events ORDER BY event_date ASC')
    res.json(rows)
  } catch (err) {
    console.error('getEvents error:', err)
    res.status(500).json({ error: 'Failed to fetch events' })
  }
}

async function postEvent(req, res) {
  try {
    const { title, event_date, event_time, description, price, location, max_capacity } = req.body
    if (!event_date || !event_time) {
      return res.status(400).json({ error: 'Date and Time are required.' })
    }
    const poster_url = req.file ? `uploads/posters/${req.file.filename}` : null
    const [result] = await db.query(
      `INSERT INTO events (title, event_date, event_time, description, poster_url, price, location, max_capacity)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, event_date, event_time, description, poster_url, price || 0, location || '', max_capacity || null]
    )
    res.status(201).json({ id: result.insertId, title })
  } catch (err) {
    console.error('postEvent error:', err)
    res.status(500).json({ error: 'Failed to create event' })
  }
}

// ── USER MANAGEMENT FUNCTIONS ──

async function inviteDeptHead(req, res) {
  const { fullName, email, departmentId } = req.body
  if (!fullName || !email || !departmentId) {
    return res.status(400).json({ error: 'Full Name, Email, and Department are required' })
  }
  try {
    const existing = await User.findByEmail(email)
    if (existing) return res.status(409).json({ error: 'User with this email already exists' })

    // ✅ Use 'DEPT_HEAD' and 'Pending OTP' — must match DB enum after SQL fix above
    const [result] = await db.query(
      `INSERT INTO users (name, email, department_id, role, status, password)
       VALUES (?, ?, ?, 'DEPT_HEAD', 'Pending OTP', NULL)`,
      [fullName, email, departmentId]
    )

    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    await User.saveOTP(email, otp)
    await sendOTPEmail(email, otp)

    // Send notification to the newly created department head
    try {
      const [[dept]] = await db.query('SELECT name FROM departments WHERE id = ?', [departmentId])
      const userId = result.insertId
      await db.query(
        'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)',
        [
          userId,
          'Department Head Invitation',
          `You have been invited as the head of the "${dept?.name || 'Department'}" department. Please verify your email to complete setup.`,
          'DEPT_HEAD_ASSIGNED'
        ]
      )
    } catch (notifErr) {
      console.error('Notification error:', notifErr.message)
      // Continue even if notification fails
    }

    res.status(201).json({ message: 'Invitation sent to ' + email })
  } catch (err) {
    console.error('Invite Error:', err)
    res.status(500).json({ error: 'Failed to process invitation: ' + err.message })
  }
}

async function inviteMember(req, res) {
  const { fullName, email, departmentId, roleTitle } = req.body
  if (!fullName || !email || !departmentId) {
    return res.status(400).json({ error: 'Full Name, Email, and Department are required' })
  }
  try {
    const existing = await User.findByEmail(email)
    if (existing) return res.status(409).json({ error: 'User with this email already exists' })

    await db.query(
      `INSERT INTO users (name, email, department_id, role, role_title, status, password)
       VALUES (?, ?, ?, 'MEMBER', ?, 'Pending OTP', NULL)`,
      [fullName, email, departmentId, roleTitle || null]
    )

    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    await User.saveOTP(email, otp)
    await sendOTPEmail(email, otp)

    res.status(201).json({ message: 'Member invitation sent to ' + email })
  } catch (err) {
    console.error('Invite Member Error:', err)
    res.status(500).json({ error: 'Failed to process invitation: ' + err.message })
  }
}

async function createUser(req, res) {
  const { name, email, password, role } = req.body
  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'All fields required' })
  }
  try {
    const existing = await User.findByEmail(email)
    if (existing) return res.status(409).json({ error: 'Email already exists' })
    const hashed = await bcrypt.hash(password, 10)
    const user = await User.createUser({ name, email, password: hashed, role, status: 'active' })
    res.status(201).json(user)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

async function listUsers(req, res) {
  try {
    const users = await User.getAllUsers()
    res.json(users)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' })
  }
}

async function getUser(req, res) {
  const id = parseInt(req.params.id, 10)
  if (req.user.role !== 'ADMIN' && req.user.id !== id) {
    return res.status(403).json({ error: 'Forbidden' })
  }
  try {
    const user = await User.findById(id)
    if (!user) return res.status(404).json({ error: 'User not found' })
    res.json(user)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

async function updateUser(req, res) {
  const id = parseInt(req.params.id, 10)
  if (req.user.role !== 'ADMIN' && req.user.id !== id) {
    return res.status(403).json({ error: 'Forbidden' })
  }
  try {
    const payload = {}
    if (req.body.name)     payload.name     = req.body.name
    if (req.body.email)    payload.email    = req.body.email
    if (req.body.password) payload.password = await bcrypt.hash(req.body.password, 10)
    await User.updateUser(id, payload)
    const updated = await User.findById(id)
    res.json(updated)
  } catch (err) {
    res.status(500).json({ error: 'Update failed' })
  }
}

async function deleteUser(req, res) {
  const id = parseInt(req.params.id, 10)
  try {
    await db.query('DELETE FROM users WHERE id = ?', [id])
    res.json({ message: 'User deleted successfully' })
  } catch (err) {
    res.status(500).json({ error: 'Delete failed' })
  }
}

module.exports = {
  getDashboardData,
  getUsers,
  getDepartments,
  addDepartment,
  assignTask,
  getEvents,
  postEvent,
  inviteDeptHead,
  inviteMember,
  createUser,
  listUsers,
  getUser,
  updateUser,
  deleteUser,
}