const express = require('express');
const router = express.Router();
const { createDepartment, getAllDepartments, getDepartmentsByEvent, updateDepartment, deleteDepartment } = require('../models/department');
const db = require('../config/db');

// GET all departments (general + event-specific) + all events
router.get('/all-with-events', async (req, res) => {
  try {
    const sql = `
      SELECT 
        d.id,
        d.name,
        d.head_id,
        d.event_id,
        e.title as event_title,
        'department' as type,
        CASE 
          WHEN d.event_id IS NULL THEN d.name
          ELSE CONCAT(d.name, ' (', IFNULL(e.title, 'Event'), ')')
        END as display_name
      FROM departments d
      LEFT JOIN events e ON d.event_id = e.id
      
      UNION ALL
      
      SELECT 
        e.id,
        e.title as name,
        NULL as head_id,
        e.id as event_id,
        e.title as event_title,
        'event' as type,
        CONCAT('📅 ', e.title) as display_name
      FROM events e
      WHERE e.id NOT IN (
        SELECT DISTINCT event_id FROM departments WHERE event_id IS NOT NULL
      )
      
      ORDER BY type DESC, display_name ASC
    `;
    const [departments] = await db.query(sql);
    res.json(departments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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
    console.log('Department creation request received:');
    console.log('  name:', name);
    console.log('  head_id:', head_id);
    console.log('  head_id type:', typeof head_id);
    console.log('  head_id is falsy?:', !head_id);
    console.log('  event_id:', event_id);
    
    // Validation: Department name is required
    if (!name || !name.trim()) {
      console.log('❌ VALIDATION FAILED: Department name is required');
      return res.status(400).json({ error: 'Department name is required' });
    }
    
    // Validation: Department head is required
    if (!head_id || head_id === '') {
      console.log('❌ VALIDATION FAILED: Department head is required');
      return res.status(400).json({ error: 'Department head is required. Please select a department head.' });
    }
    
    console.log('✅ Validations passed, creating department');
    try {
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
    } catch (createErr) {
      console.error('❌ Department creation error:', createErr);
      return res.status(400).json({ error: createErr.message });
    }
  } catch (err) {
    console.error('❌ Department creation error:', err);
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