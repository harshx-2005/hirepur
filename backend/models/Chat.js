const { pool } = require('../config/db');

const Chat = {
    // 1. Get or create a conversation between two users
    getOrCreateConversation: async (userId1, userId2) => {
        const u1 = Math.min(userId1, userId2);
        const u2 = Math.max(userId1, userId2);

        // Check if conversation exists
        const [rows] = await pool.query(
            'SELECT id FROM conversations WHERE user1_id = ? AND user2_id = ?',
            [u1, u2]
        );

        if (rows.length > 0) {
            return rows[0].id;
        }

        // Create one
        const [result] = await pool.query(
            'INSERT INTO conversations (user1_id, user2_id) VALUES (?, ?)',
            [u1, u2]
        );
        return result.insertId;
    },

    // 2. Save a message
    saveMessage: async (conversationId, senderId, receiverId, content) => {
        // Ensure conversation exists or update conversation's updated_at
        await pool.query(
            'UPDATE conversations SET updated_at = NOW() WHERE id = ?',
            [conversationId]
        );

        const [result] = await pool.query(
            `INSERT INTO messages (conversation_id, sender_id, message, is_read) 
             VALUES (?, ?, ?, 0)`,
            [conversationId, senderId, content]
        );
        return result.insertId;
    },

    // 3. Fetch history for a conversation
    getHistory: async (conversationId) => {
        const [rows] = await pool.query(
            `SELECT m.*, m.timestamp as created_at FROM messages m
             WHERE m.conversation_id = ? 
             ORDER BY m.timestamp ASC`,
            [conversationId]
        );
        return rows;
    },

    // Helper: Get history by partner IDs (for backward compatibility)
    getHistoryByPartners: async (userId1, userId2) => {
        const u1 = Math.min(userId1, userId2);
        const u2 = Math.max(userId1, userId2);

        const [conv] = await pool.query(
            'SELECT id FROM conversations WHERE user1_id = ? AND user2_id = ?',
            [u1, u2]
        );

        if (conv.length === 0) return [];
        return Chat.getHistory(conv[0].id);
    },

    // 4. Retrieve conversations for a user with last message and unread count
    getConversations: async (userId) => {
        // This query fetches conversations, finds the partner's user details,
        // pulls the last message, and computes the count of unread messages.
        const [rows] = await pool.query(
            `SELECT 
                c.id AS conversation_id,
                c.created_at,
                c.updated_at,
                u.id AS partner_id,
                u.name AS partner_name,
                u.email AS partner_email,
                u.profile_pic AS partner_profile_pic,
                u.role AS partner_role,
                (
                    SELECT m.message FROM messages m 
                    WHERE m.conversation_id = c.id 
                    ORDER BY m.timestamp DESC LIMIT 1
                ) AS last_message,
                (
                    SELECT m.timestamp FROM messages m 
                    WHERE m.conversation_id = c.id 
                    ORDER BY m.timestamp DESC LIMIT 1
                ) AS last_message_time,
                (
                    SELECT COUNT(*) FROM messages m 
                    WHERE m.conversation_id = c.id AND m.sender_id = u.id AND m.is_read = 0
                ) AS unread_count
             FROM conversations c
             JOIN users u ON (u.id = c.user1_id AND c.user2_id = ?) OR (u.id = c.user2_id AND c.user1_id = ?)
             ORDER BY c.updated_at DESC`,
            [userId, userId]
        );
        return rows;
    },

    // 5. Mark messages as read
    markAsRead: async (conversationId, senderId) => {
        await pool.query(
            `UPDATE messages SET is_read = 1 
             WHERE conversation_id = ? AND sender_id = ? AND is_read = 0`,
            [conversationId, senderId]
        );
    },

    // 6. Security Check: Can these two users communicate?
    canChat: async (userId, partnerId) => {
        // Retrieve roles
        const [users] = await pool.query('SELECT id, role FROM users WHERE id IN (?, ?)', [userId, partnerId]);
        if (users.length < 2) return false;

        const myUser = users.find(u => u.id == userId);
        const partnerUser = users.find(u => u.id == partnerId);

        if (!myUser || !partnerUser) return false;

        // Rule A: If a conversation already exists, they can chat (handles continuous chat & migrated chats)
        const u1 = Math.min(userId, partnerId);
        const u2 = Math.max(userId, partnerId);
        const [conv] = await pool.query('SELECT id FROM conversations WHERE user1_id = ? AND user2_id = ?', [u1, u2]);
        if (conv.length > 0) return true;

        // Rule B: Employer messaging a Candidate who applied to their jobs
        if (myUser.role === 'employer' && partnerUser.role === 'job_seeker') {
            const [app] = await pool.query(
                `SELECT a.id FROM applications a
                 JOIN jobs j ON j.id = a.job_id
                 JOIN employer_profile ep ON ep.id = j.employer_id
                 WHERE ep.user_id = ? AND a.user_id = ?
                 LIMIT 1`,
                [userId, partnerId]
            );
            return app.length > 0;
        }

        // Rule C: Job Seeker messaging an Employer of a job they applied to
        if (myUser.role === 'job_seeker' && partnerUser.role === 'employer') {
            const [app] = await pool.query(
                `SELECT a.id FROM applications a
                 JOIN jobs j ON j.id = a.job_id
                 JOIN employer_profile ep ON ep.id = j.employer_id
                 WHERE a.user_id = ? AND ep.user_id = ?
                 LIMIT 1`,
                [userId, partnerId]
            );
            return app.length > 0;
        }

        // Rule D: Admins can chat with anyone
        if (myUser.role === 'admin' || partnerUser.role === 'admin') {
            return true;
        }

        return false;
    }
};

module.exports = Chat;
