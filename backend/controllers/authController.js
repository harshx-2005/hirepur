const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const otpService = require('../services/otpService');
const { pool } = require('../config/db');

// Token Helpers
const generateAccessToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET || 'supersecretjwtkey_hirepur_jobportal_2026', {
        expiresIn: '15m', // Access tokens expire in 15 minutes
    });
};

const generateRefreshToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_REFRESH_SECRET || 'supersecretrefreshkey_hirepur_jobportal_2026', {
        expiresIn: '7d', // Refresh tokens expire in 7 days
    });
};

// 1. User Registration with OTP Gating
exports.register = async (req, res, next) => {
    try {
        const { name, email, password, role, company_name, company_website, company_size, industry, company_description, location } = req.body;

        const emailExists = await User.findByEmail(email);
        if (emailExists) {
            return res.status(400).json({ success: false, message: 'Email already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Save new user as unverified by default (is_verified = 0)
        const userId = await User.create({ name, email, password: hashedPassword, role, is_verified: 0 });

        // Build respective profiles in database
        if (role === 'job_seeker') {
            await User.createJobSeekerProfile(userId);
        } else if (role === 'employer') {
            await User.createEmployerProfile(userId, { company_name, company_website, company_size, industry, company_description, location });
        }

        // Generate and send registration OTP
        await otpService.generateAndSend(email, 'registration');

        res.status(201).json({
            success: true,
            message: 'Registration successful! Verification code dispatched to your email.',
            email,
            requiresVerification: true
        });

    } catch (error) {
        console.error('❌ Register Controller Error:', error);
        res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};

// 2. User Login with Verification Gate
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Verification Gate Check
        if (!user.is_verified) {
            // Trigger a fresh OTP send if none exists
            try {
                await otpService.generateAndSend(email, 'registration');
            } catch (err) {
                // Ignore throttle errors so they can proceed to verify screen
            }
            return res.status(403).json({
                success: false,
                message: 'Please verify your email address to log in.',
                requiresVerification: true,
                email: user.email
            });
        }

        // Generate Tokens
        const token = generateAccessToken(user.id, user.role);
        const refreshToken = generateRefreshToken(user.id, user.role);

        // Store refresh token session in database
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days expiration
        const deviceInfo = req.headers['user-agent'] || 'Unknown Device';
        await pool.query(
            `INSERT INTO user_sessions (user_id, refresh_token, device_info, expires_at) 
             VALUES (?, ?, ?, ?)`,
            [user.id, refreshToken, deviceInfo, expiresAt]
        );

        res.status(200).json({
            success: true,
            token,
            refreshToken,
            user: { id: user.id, name: user.name, email: user.email, role: user.role, profile_pic: user.profile_pic }
        });

    } catch (error) {
        console.error('❌ Login Controller Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// 3. Verify OTP Code Endpoint
exports.verifyOtp = async (req, res, next) => {
    try {
        const { email, otp, type } = req.body;

        // Verify using OTP Service
        await otpService.verify(email, otp, type);

        // Fetch user detail
        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // If registration verification, mark user verified in DB
        if (type === 'registration') {
            await User.verifyEmail(email);
        }

        // Generate Tokens
        const token = generateAccessToken(user.id, user.role);
        const refreshToken = generateRefreshToken(user.id, user.role);

        // Store refresh token session in database
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days expiration
        const deviceInfo = req.headers['user-agent'] || 'Unknown Device';
        await pool.query(
            `INSERT INTO user_sessions (user_id, refresh_token, device_info, expires_at) 
             VALUES (?, ?, ?, ?)`,
            [user.id, refreshToken, deviceInfo, expiresAt]
        );

        res.status(200).json({
            success: true,
            message: 'Email successfully verified!',
            token,
            refreshToken,
            user: { id: user.id, name: user.name, email: user.email, role: user.role, profile_pic: user.profile_pic }
        });

    } catch (error) {
        console.error('❌ Verify OTP Controller Error:', error);
        res.status(400).json({ success: false, message: error.message || 'Verification failed' });
    }
};

// 4. Resend OTP Code Endpoint
exports.resendOtp = async (req, res, next) => {
    try {
        const { email, type } = req.body;

        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        await otpService.generateAndSend(email, type);

        res.status(200).json({
            success: true,
            message: 'A fresh verification code has been dispatched to your email.'
        });

    } catch (error) {
        console.error('❌ Resend OTP Controller Error:', error);
        res.status(400).json({ success: false, message: error.message || 'Failed to resend verification code' });
    }
};

// 5. Request Password Reset OTP
exports.forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;

        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(404).json({ success: false, message: 'No registered user matches this email address.' });
        }

        // Generate and Send Password recovery OTP
        await otpService.generateAndSend(email, 'forgot_password');

        res.status(200).json({
            success: true,
            message: 'Password recovery verification code sent to your email.'
        });

    } catch (error) {
        console.error('❌ Forgot Password Controller Error:', error);
        res.status(400).json({ success: false, message: error.message || 'Forgot password failed' });
    }
};

// 6. Reset Password Endpoint
exports.resetPassword = async (req, res, next) => {
    try {
        const { email, otp, newPassword } = req.body;

        // Verify the recovery OTP
        await otpService.verify(email, otp, 'forgot_password');

        // Hash and Update User Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        await User.updatePassword(email, hashedPassword);

        res.status(200).json({
            success: true,
            message: 'Your password has been successfully updated! You can now log in.'
        });

    } catch (error) {
        console.error('❌ Reset Password Controller Error:', error);
        res.status(400).json({ success: false, message: error.message || 'Failed to reset password.' });
    }
};

// 7. Refresh JWT Token Endpoint
exports.refreshToken = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(401).json({ success: false, message: 'Refresh token is required.' });
        }

        // Verify token cryptographically
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'supersecretrefreshkey_hirepur_jobportal_2026');

        // Validate session is active and stored in database
        const [rows] = await pool.query(
            'SELECT * FROM user_sessions WHERE refresh_token = ? AND expires_at > NOW()',
            [refreshToken]
        );

        if (rows.length === 0) {
            return res.status(401).json({ success: false, message: 'Invalid or expired session.' });
        }

        // Generate new Access Token
        const token = generateAccessToken(decoded.id, decoded.role);

        res.status(200).json({
            success: true,
            token
        });

    } catch (error) {
        console.error('❌ Refresh Token Controller Error:', error);
        res.status(401).json({ success: false, message: 'Session expired. Please log in again.' });
    }
};

// 8. Logout / End Active Session
exports.logout = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        if (refreshToken) {
            // Delete token session from database
            await pool.query('DELETE FROM user_sessions WHERE refresh_token = ?', [refreshToken]);
        }

        res.status(200).json({
            success: true,
            message: 'Successfully logged out.'
        });
    } catch (error) {
        console.error('❌ Logout Controller Error:', error);
        res.status(500).json({ success: false, message: 'Server error during logout.' });
    }
};

// 9. Get Authenticated User Details
exports.getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.status(200).json({ 
            success: true, 
            user: { id: user.id, name: user.name, email: user.email, role: user.role, profile_pic: user.profile_pic, is_verified: user.is_verified } 
        });
    } catch (error) {
        console.error('❌ getMe Controller Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
