const express = require('express');
const router = express.Router();
const { createDepartment, getAllDepartments, getDepartmentsByEvent, updateDepartment, deleteDepartment } = require('../models/department');
const db = require('../config/db');

// GET all general departments (no event)
router.get('/', async (req, res) => {
  try {
    const departments = await getAllDepartments();
    res.json(departments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET departments for a specific event
router.get('/event/:event_id', async (req, res) => {
  try {
    const departments = await getDepartmentsByEvent(req.params.event_id);
    res.json(departments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create a department (general or event-specific)
router.post('/', async (req, res) => {
  try {
    const { name, head_id, event_id } = req.body;
    const dept = await createDepartment(name, head_id, event_id || null);
    
    // Send notification to department head if assigned
    if (head_id) {
      try {
        const [[headUser]] = await db.query('SELECT name, email FROM users WHERE id = ?', [head_id]);
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
          );
        }
      } catch (notifErr) {
        console.error('Notification error:', notifErr.message);
        // Continue even if notification fails
      }
    }
    
    res.json(dept);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update a department name
router.put('/:id', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Department name is required' });
    const dept = await updateDepartment(parseInt(req.params.id), name);
    res.json(dept);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE a department
router.delete('/:id', async (req, res) => {
  try {
    await deleteDepartment(parseInt(req.params.id));
    res.json({ message: 'Department deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;