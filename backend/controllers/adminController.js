const { pool } = require('../config/db');

exports.getStats = async (req, res) => {
    try {
        console.log('Fetching admin stats...');
        const [userCount] = await pool.query('SELECT COUNT(*) as total FROM users');
        const [jobCount] = await pool.query('SELECT COUNT(*) as total FROM jobs');
        const [applicationCount] = await pool.query('SELECT COUNT(*) as total FROM applications');
        const [employerCount] = await pool.query('SELECT COUNT(*) as total FROM users WHERE role = "employer"');

        const stats = {
            users: userCount[0].total,
            jobs: jobCount[0].total,
            applications: applicationCount[0].total,
            employers: employerCount[0].total
        };
        console.log('Admin Stats:', stats);

        res.status(200).json({
            success: true,
            stats
        });
    } catch (error) {
        console.error('Admin Stats Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const { search } = req.query;
        let query = 'SELECT id, name, email, role, created_at FROM users';
        let params = [];

        if (search) {
            query += ' WHERE name LIKE ? OR email LIKE ?';
            params = [`%${search}%`, `%${search}%`];
        }

        query += ' ORDER BY created_at DESC';
        const [rows] = await pool.query(query, params);
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        console.error('Admin Users Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (id == req.user.id) {
            return res.status(400).json({ success: false, message: 'Admins cannot delete their own account.' });
        }
        await pool.query('DELETE FROM users WHERE id = ?', [id]);
        res.status(200).json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        console.error('Delete User Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getAllJobs = async (req, res) => {
    try {
        const { search } = req.query;
        let query = `
            SELECT j.*, e.company_name 
            FROM jobs j 
            LEFT JOIN employer_profile e ON j.employer_id = e.id
        `;
        let params = [];

        if (search) {
            query += ' WHERE j.title LIKE ? OR e.company_name LIKE ?';
            params = [`%${search}%`, `%${search}%`];
        }

        query += ' ORDER BY j.created_at DESC';
        const [rows] = await pool.query(query, params);
        console.log(`Fetched ${rows.length} jobs for admin`);
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        console.error('Admin Jobs Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.deleteJob = async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM jobs WHERE id = ?', [id]);
        res.status(200).json({ success: true, message: 'Job deleted successfully' });
    } catch (error) {
        console.error('Delete Job Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;
        
        if (!['job_seeker', 'employer', 'admin'].includes(role)) {
            return res.status(400).json({ success: false, message: 'Invalid role' });
        }

        if (id == req.user.id) {
            return res.status(400).json({ success: false, message: 'You cannot change your own role.' });
        }

        await pool.query('UPDATE users SET role = ? WHERE id = ?', [role, id]);
        res.status(200).json({ success: true, message: 'User role updated successfully' });
    } catch (error) {
        console.error('Update Role Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
