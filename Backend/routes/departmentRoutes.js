const express = require('express');
const router = express.Router();
const { createDepartment, getAllDepartments, getDepartmentsByEvent } = require('../models/department');

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
    res.json(dept);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;