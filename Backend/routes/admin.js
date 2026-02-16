const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController'); 

// GET: Dashboard Data
router.get('/dashboard', adminController.getDashboardData);

// --- NEW ROUTE: Fetch Users for Department Head Dropdown ---
// This matches the fetch('http://localhost:3000/api/admin/users') in your frontend
router.get('/users', adminController.getUsers);

// GET: Fetch Departments for Dropdowns
router.get('/departments', adminController.getDepartments);

// POST: Add Department
router.post('/add-department', adminController.addDepartment);

// POST: Assign Task
router.post('/assign-task', adminController.assignTask);

// POST: Post Event
router.post('/post-event', adminController.postEvent);

module.exports = router;