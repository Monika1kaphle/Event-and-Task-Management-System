const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController'); 

// --- ADMIN ROUTES ---

// GET: Dashboard Data
router.get('/dashboard', adminController.getDashboardData);

// GET: Fetch Users
router.get('/users', adminController.getUsers);

// GET: Fetch Departments
router.get('/departments', adminController.getDepartments);

// POST: Add Department
router.post('/add-department', adminController.addDepartment);

// POST: Assign Task
router.post('/assign-task', adminController.assignTask);

module.exports = router;