const { pool } = require('../config/db');

async function migrate() {
    try {
        console.log('🔄 Starting Database Upgrades...');

        // 1. Create conversations table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS conversations (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user1_id INT NOT NULL,
                user2_id INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user1_id) REFERENCES USERS(id) ON DELETE CASCADE,
                FOREIGN KEY (user2_id) REFERENCES USERS(id) ON DELETE CASCADE,
                UNIQUE KEY unique_user_pair (user1_id, user2_id),
                INDEX idx_user1 (user1_id),
                INDEX idx_user2 (user2_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
        `);
        console.log('✔️ Conversations table validated.');

        // 2. Create messages table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS messages (
                id INT AUTO_INCREMENT PRIMARY KEY,
                conversation_id INT NOT NULL,
                sender_id INT NOT NULL,
                message TEXT NOT NULL,
                is_read TINYINT(1) DEFAULT 0,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
                FOREIGN KEY (sender_id) REFERENCES USERS(id) ON DELETE CASCADE,
                INDEX idx_conversation (conversation_id),
                INDEX idx_sender (sender_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
        `);
        console.log('✔️ Messages table validated.');

        // 3. Create otp_verifications table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS otp_verifications (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(255) NOT NULL,
                otp VARCHAR(255) NOT NULL,
                expires_at TIMESTAMP NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                is_verified TINYINT(1) DEFAULT 0,
                type ENUM('registration', 'forgot_password', 'secure_login') NOT NULL,
                INDEX idx_email (email)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
        `);
        console.log('✔️ OTP Verifications table validated.');

        // 4. Create user_sessions table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS user_sessions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                refresh_token VARCHAR(500) NOT NULL,
                device_info VARCHAR(255) DEFAULT NULL,
                expires_at TIMESTAMP NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES USERS(id) ON DELETE CASCADE,
                INDEX idx_user_id (user_id),
                INDEX idx_refresh_token (refresh_token)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
        `);
        console.log('✔️ User Sessions table validated.');

        // 5. Add is_verified to USERS table safely
        const [columns] = await pool.query("SHOW COLUMNS FROM USERS LIKE 'is_verified'");
        if (columns.length === 0) {
            await pool.query('ALTER TABLE USERS ADD COLUMN is_verified TINYINT(1) DEFAULT 0');
            console.log('✔️ Added is_verified column to USERS.');
        } else {
            console.log('✔️ is_verified column already exists in USERS.');
        }

        // 6. Add type and related_id to NOTIFICATIONS safely
        const [notifTypeCol] = await pool.query("SHOW COLUMNS FROM NOTIFICATIONS LIKE 'type'");
        if (notifTypeCol.length === 0) {
            await pool.query("ALTER TABLE NOTIFICATIONS ADD COLUMN type VARCHAR(50) DEFAULT 'general'");
            console.log('✔️ Added type column to NOTIFICATIONS.');
        } else {
            console.log('✔️ type column already exists in NOTIFICATIONS.');
        }

        const [notifRelatedCol] = await pool.query("SHOW COLUMNS FROM NOTIFICATIONS LIKE 'related_id'");
        if (notifRelatedCol.length === 0) {
            await pool.query("ALTER TABLE NOTIFICATIONS ADD COLUMN related_id INT DEFAULT NULL");
            console.log('✔️ Added related_id column to NOTIFICATIONS.');
        } else {
            console.log('✔️ related_id column already exists in NOTIFICATIONS.');
        }

        // 7. Set existing users to active/verified so they don't get locked out
        await pool.query('UPDATE USERS SET is_verified = 1');
        console.log('✔️ Existing demo users validated & verified.');

        // 8. Migrate existing chat messages from chat_messages table if it exists
        const [tables] = await pool.query("SHOW TABLES LIKE 'CHAT_MESSAGES'");
        if (tables.length > 0) {
            console.log('📦 Migrating older historical chat logs...');
            const [oldMessages] = await pool.query('SELECT * FROM CHAT_MESSAGES ORDER BY timestamp ASC');
            
            for (const msg of oldMessages) {
                const u1 = Math.min(msg.sender_id, msg.receiver_id);
                const u2 = Math.max(msg.sender_id, msg.receiver_id);

                let convId;
                const [convRows] = await pool.query(
                    'SELECT id FROM conversations WHERE user1_id = ? AND user2_id = ?',
                    [u1, u2]
                );

                if (convRows.length > 0) {
                    convId = convRows[0].id;
                } else {
                    const [insertResult] = await pool.query(
                        'INSERT INTO conversations (user1_id, user2_id) VALUES (?, ?)',
                        [u1, u2]
                    );
                    convId = insertResult.insertId;
                }

                const [existingMessage] = await pool.query(
                    'SELECT id FROM messages WHERE conversation_id = ? AND sender_id = ? AND message = ? AND timestamp = ?',
                    [convId, msg.sender_id, msg.message, msg.timestamp]
                );

                if (existingMessage.length === 0) {
                    await pool.query(
                        'INSERT INTO messages (conversation_id, sender_id, message, timestamp, is_read) VALUES (?, ?, ?, ?, 1)',
                        [convId, msg.sender_id, msg.message, msg.timestamp]
                    );
                }
            }
            console.log(`🎉 Migrated ${oldMessages.length} chat logs to conversations database.`);
        }

        console.log('🚀 Database Migration Successfully Completed.');
        if (require.main === module) {
            process.exit(0);
        }
    } catch (error) {
        console.error('❌ Migration Error:', error);
        if (require.main === module) {
            process.exit(1);
        } else {
            throw error;
        }
    }
}

if (require.main === module) {
    migrate();
} else {
    module.exports = migrate;
}
