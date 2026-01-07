const express = require('express');
const router = express.Router();
const { login, registerClient } = require('../controllers/authController');

router.post('/login', login);
router.post('/register', registerClient);

module.exports = router;
