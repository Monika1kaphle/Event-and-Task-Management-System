const express = require('express');
const router = express.Router();

const { login, registerClient, sendOtp } = require('../controllers/authController');
const { verifyOtp} = require('../controllers/authController');

router.post('/login', login);
router.post('/register', registerClient);
router.post('/verify-otp', verifyOtp);

// // OTP Routes
 router.post('/send-otp', sendOtp);


module.exports = router;