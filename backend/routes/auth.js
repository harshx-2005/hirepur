const express = require('express');
const router = express.Router();
const { 
    register, 
    login, 
    verifyOtp, 
    resendOtp, 
    forgotPassword, 
    resetPassword, 
    refreshToken, 
    logout, 
    getMe 
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

// Core Authentication
router.post('/register', validate('register'), register);
router.post('/login', validate('login'), login);
router.post('/logout', logout);

// OTP Verification System
router.post('/verify-otp', validate('verifyOtp'), verifyOtp);
router.post('/resend-otp', validate('resendOtp'), resendOtp);

// Password Recovery System
router.post('/forgot-password', validate('forgotPassword'), forgotPassword);
router.post('/reset-password', validate('resetPassword'), resetPassword);

// Token Sessions
router.post('/refresh-token', refreshToken);

// Authenticated Profiling
router.get('/me', protect, getMe);

module.exports = router;
