const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, updateProfilePic } = require('../controllers/profileController');
const { protect } = require('../middleware/auth');

router.get('/me', protect, getProfile);
router.get('/:id', protect, require('../controllers/profileController').getUserById);
router.put('/me', protect, updateProfile);
router.put('/profile-pic', protect, updateProfilePic);

module.exports = router;
