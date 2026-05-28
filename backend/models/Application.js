const { pool } = require('../config/db');

const Application = {
    create: async (applicationData) => {
        const { job_id, user_id, resume_url, cover_letter } = applicationData;
        const [result] = await pool.query(
            'INSERT INTO APPLICATIONS (job_id, user_id, resume_url, cover_letter) VALUES (?, ?, ?, ?)',
            [job_id, user_id, resume_url, cover_letter]
        );
        return result.insertId;
    },

    findByUser: async (userId) => {
        const [rows] = await pool.query(`
            SELECT a.*, j.title, e.company_name, e.company_logo 
            FROM APPLICATIONS a 
            JOIN JOBS j ON a.job_id = j.id 
            JOIN EMPLOYER_PROFILE e ON j.employer_id = e.id 
            WHERE a.user_id = ?
            ORDER BY a.applied_at DESC
        `, [userId]);
        return rows;
    },

    findByJob: async (jobId) => {
        const [rows] = await pool.query(`
            SELECT a.*, u.name, u.email, p.headline, p.skills, p.experience, p.education 
            FROM APPLICATIONS a 
            JOIN USERS u ON a.user_id = u.id 
            JOIN JOB_SEEKER_PROFILE p ON u.id = p.user_id 
            WHERE a.job_id = ?
            ORDER BY a.applied_at DESC
        `, [jobId]);
        return rows;
    },

    updateStatus: async (id, status) => {
        if (!['applied', 'under_review', 'interview', 'accepted', 'rejected'].includes(status)) {
            throw new Error("Invalid status");
        }
        const [result] = await pool.query('UPDATE APPLICATIONS SET status = ? WHERE id = ?', [status, id]);
        return result.affectedRows > 0;
    },
    
    findById: async (id) => {
        const [rows] = await pool.query('SELECT * FROM APPLICATIONS WHERE id = ?', [id]);
        return rows.length ? rows[0] : null;
    }
};

module.exports = Application;
