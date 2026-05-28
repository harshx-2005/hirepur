const { pool } = require('../config/db');

const Job = {
    findAll: async (filters = {}, page = 1, limit = 10) => {
        let query = 'SELECT j.*, e.company_name, e.company_logo FROM JOBS j JOIN EMPLOYER_PROFILE e ON j.employer_id = e.id WHERE 1=1';
        const queryParams = [];

        if (filters.title) {
            query += ' AND (j.title LIKE ? OR j.description LIKE ?)';
            queryParams.push(`%${filters.title}%`, `%${filters.title}%`);
        }
        if (filters.location) {
            query += ' AND j.location LIKE ?';
            queryParams.push(`%${filters.location}%`);
        }
        if (filters.job_type) {
            query += ' AND j.job_type = ?';
            queryParams.push(filters.job_type);
        }

        query += ' ORDER BY j.created_at DESC';
        
        // Add Pagination
        const offset = (page - 1) * limit;
        query += ' LIMIT ? OFFSET ?';
        queryParams.push(limit, offset);

        const [rows] = await pool.query(query, queryParams);
        return rows;
    },

    countAll: async (filters = {}) => {
        let query = 'SELECT COUNT(*) as total FROM JOBS j JOIN EMPLOYER_PROFILE e ON j.employer_id = e.id WHERE 1=1';
        const queryParams = [];

        if (filters.title) {
            query += ' AND (j.title LIKE ? OR j.description LIKE ?)';
            queryParams.push(`%${filters.title}%`, `%${filters.title}%`);
        }
        if (filters.location) {
            query += ' AND j.location LIKE ?';
            queryParams.push(`%${filters.location}%`);
        }
        if (filters.job_type) {
            query += ' AND j.job_type = ?';
            queryParams.push(filters.job_type);
        }

        const [rows] = await pool.query(query, queryParams);
        return rows[0].total;
    },

    findById: async (id) => {
        const [rows] = await pool.query(
            'SELECT j.*, e.company_name, e.company_logo, e.company_website, e.industry, e.user_id as employer_user_id FROM JOBS j JOIN EMPLOYER_PROFILE e ON j.employer_id = e.id WHERE j.id = ?',
            [id]
        );
        return rows.length ? rows[0] : null;
    },

    create: async (employerId, jobData) => {
        const { title, description, salary_range, experience_required, job_type, work_mode, location, skills_required } = jobData;
        
        // Ensure skills_required is stored as JSON string
        const skillsJson = JSON.stringify(skills_required || []);

        const [result] = await pool.query(
            'INSERT INTO JOBS (employer_id, title, description, salary_range, experience_required, job_type, work_mode, location, skills_required) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [employerId, title, description, salary_range, experience_required, job_type, work_mode, location, skillsJson]
        );
        return result.insertId;
    },
    
    update: async (id, jobData) => {
        // Simple update logic for the required fields
        const { title, description, salary_range, experience_required, job_type, work_mode, location, skills_required } = jobData;
        const skillsJson = skills_required ? JSON.stringify(skills_required) : undefined;
        
        const [result] = await pool.query(
            'UPDATE JOBS SET title = COALESCE(?, title), description = COALESCE(?, description), salary_range = COALESCE(?, salary_range), experience_required = COALESCE(?, experience_required), job_type = COALESCE(?, job_type), work_mode = COALESCE(?, work_mode), location = COALESCE(?, location), skills_required = COALESCE(?, skills_required) WHERE id = ?',
            [title, description, salary_range, experience_required, job_type, work_mode, location, skillsJson, id]
        );
        return result.affectedRows > 0;
    },

    delete: async (id) => {
        const [result] = await pool.query('DELETE FROM JOBS WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }
};

module.exports = Job;
