const express = require('express');
const router = express.Router();
const { getChatHistory, getConversations, sendMessage } = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

router.get('/history/:userId', protect, getChatHistory);
router.get('/conversations', protect, getConversations);
router.post('/send', protect, sendMessage);

module.exports = router;
