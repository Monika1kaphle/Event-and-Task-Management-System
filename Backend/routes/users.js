const express = require('express');
const router = express.Router();
const { loginRequired, attachUser } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/roles');
const userController = require('../controllers/userController');

// All routes here require authentication
router.use(loginRequired, attachUser);

// --- MEMBER INVITATION & CREATION ---
// Updated: Now both ADMIN and DEPT_HEAD can invite members
router.post('/invite-member', authorizeRoles('ADMIN', 'DEPT_HEAD'), userController.inviteMember);
router.post('/invite-dept-head', authorizeRoles('ADMIN'), userController.inviteDeptHead);
router.post('/', authorizeRoles('ADMIN'), userController.createUser);

// --- USER LISTING & FILTERING ---
/**
 * Modified: List Users
 * Admin gets everyone.
 * Dept Head gets only members of their own department.
 */
router.get('/', authorizeRoles('ADMIN', 'DEPT_HEAD'), userController.listUsers);

// Specialized route for Dept Head Manage Members page (if needed separately)
router.get('/members/department', authorizeRoles('DEPT_HEAD'), userController.getDepartmentMembers);

// --- INDIVIDUAL USER ACTIONS ---
router.get('/:id', userController.getUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', authorizeRoles('ADMIN'), userController.deleteUser);

module.exports = router;