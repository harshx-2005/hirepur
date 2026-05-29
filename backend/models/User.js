const { pool } = require('../config/db');

const User = {
    findByEmail: async (email) => {
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        return rows.length ? rows[0] : null;
    },

    findById: async (id) => {
        const [rows] = await pool.query('SELECT id, name, email, role, profile_pic, is_verified, created_at FROM users WHERE id = ?', [id]);
        return rows.length ? rows[0] : null;
    },

    create: async (userData) => {
        const { name, email, password, role, profile_pic, is_verified } = userData;
        const [result] = await pool.query(
            'INSERT INTO users (name, email, password, role, profile_pic, is_verified) VALUES (?, ?, ?, ?, ?, ?)',
            [name, email, password, role, profile_pic || null, is_verified || 0]
        );
        return result.insertId;
    },
    
    verifyEmail: async (email) => {
        await pool.query('UPDATE users SET is_verified = 1 WHERE email = ?', [email]);
    },

    updatePassword: async (email, hashedPassword) => {
        await pool.query('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, email]);
    },
    
    createJobSeekerProfile: async (userId) => {
        await pool.query('INSERT INTO job_seeker_profile (user_id) VALUES (?)', [userId]);
    },
    
    createEmployerProfile: async (userId, companyData) => {
        const { company_name, company_website, company_size, industry, company_description, location } = companyData;
        await pool.query(
            'INSERT INTO employer_profile (user_id, company_name, company_website, company_size, industry, company_description, location) VALUES (?, ?, ?, ?, ?, ?, ?)', 
            [userId, company_name, company_website || null, company_size || null, industry || null, company_description || null, location || null]
        );
    }
};

module.exports = User;
