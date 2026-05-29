const { pool } = require('../config/db');

// 1. Fetch user notifications list
exports.getNotifications = async (req, res, next) => {
    try {
        const [rows] = await pool.query(
            `SELECT id, message, is_read, type, related_id, created_at 
             FROM notifications 
             WHERE user_id = ? 
             ORDER BY created_at DESC 
             LIMIT 50`,
            [req.user.id]
        );

        const [countRow] = await pool.query(
            `SELECT COUNT(*) as unread_count 
             FROM notifications 
             WHERE user_id = ? AND is_read = 0`,
            [req.user.id]
        );

        res.status(200).json({ 
            success: true, 
            unread_count: countRow[0]?.unread_count || 0,
            data: rows 
        });
    } catch (error) {
        console.error('❌ Get Notifications Controller Error:', error);
        res.status(500).json({ success: false, message: 'Server error retrieving notifications' });
    }
};

// 2. Mark specific notification as read
exports.markAsRead = async (req, res, next) => {
    try {
        const notificationId = req.params.id;
        await pool.query(
            'UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?',
            [notificationId, req.user.id]
        );

        res.status(200).json({ success: true, message: 'Notification marked as read.' });
    } catch (error) {
        console.error('❌ Mark Notification Read Controller Error:', error);
        res.status(500).json({ success: false, message: 'Server error marking notification' });
    }
};

// 3. Mark all notifications as read
exports.markAllAsRead = async (req, res, next) => {
    try {
        await pool.query(
            'UPDATE notifications SET is_read = 1 WHERE user_id = ?',
            [req.user.id]
        );

        res.status(200).json({ success: true, message: 'All notifications marked as read.' });
    } catch (error) {
        console.error('❌ Mark All Notifications Read Controller Error:', error);
        res.status(500).json({ success: false, message: 'Server error updating notifications' });
    }
};
