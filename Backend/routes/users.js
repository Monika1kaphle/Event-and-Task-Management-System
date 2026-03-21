const express = require('express');
const router = express.Router();
const { loginRequired, attachUser } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/roles');
const userController = require('../controllers/adminController');

router.use(loginRequired, attachUser);

router.post('/invite-dept-head', authorizeRoles('ADMIN'), userController.inviteDeptHead);
router.post('/invite-member', authorizeRoles('ADMIN'), userController.inviteMember);
router.post('/', authorizeRoles('ADMIN'), userController.createUser);
router.get('/', authorizeRoles('ADMIN'), userController.listUsers);
router.get('/:id', userController.getUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', authorizeRoles('ADMIN'), userController.deleteUser);

module.exports = router;