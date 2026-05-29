const { pool } = require('../config/db');

exports.getDashboardStats = async (req, res) => {
    try {
        if (req.user.role !== 'employer') {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        const [employerProfile] = await pool.query('SELECT id FROM employer_profile WHERE user_id = ?', [req.user.id]);
        if (employerProfile.length === 0) {
            return res.status(200).json({
                success: true,
                data: {
                    totalJobs: 0,
                    activeJobs: 0,
                    totalApplications: 0,
                    totalShortlisted: 0,
                    hiringConversionRate: '0%'
                }
            });
        }
        const employerId = employerProfile[0].id;

        // Total Jobs Posted
        const [jobsResult] = await pool.query('SELECT COUNT(*) as total FROM jobs WHERE employer_id = ?', [employerId]);
        const totalJobs = jobsResult[0].total;

        // Total Applications Received
        const [appsResult] = await pool.query(`
            SELECT COUNT(*) as total 
            FROM applications a 
            JOIN jobs j ON a.job_id = j.id 
            WHERE j.employer_id = ?
        `, [employerId]);
        const totalApplications = appsResult[0].total;

        // Shortlisted Candidates (using 'under_review' or 'interview' or 'accepted' as shortlisted)
        const [shortlistedResult] = await pool.query(`
            SELECT COUNT(*) as total 
            FROM applications a 
            JOIN jobs j ON a.job_id = j.id 
            WHERE j.employer_id = ? AND a.status IN ('under_review', 'interview', 'accepted')
        `, [employerId]);
        const totalShortlisted = shortlistedResult[0].total;

        // Active Jobs
        // Assuming all are active for now, you could add status to jobs table
        const activeJobs = totalJobs; 

        res.status(200).json({
            success: true,
            data: {
                totalJobs,
                activeJobs,
                totalApplications,
                totalShortlisted,
                hiringConversionRate: totalApplications > 0 ? ((totalShortlisted / totalApplications) * 100).toFixed(1) + '%' : '0%'
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error fetching employer analytics' });
    }
};

exports.getEmployerApplications = async (req, res) => {
    try {
        const [employerRows] = await pool.query('SELECT id FROM employer_profile WHERE user_id = ?', [req.user.id]);
        if (employerRows.length === 0) return res.status(200).json({ success: true, count: 0, data: [] });
        
        const employerId = employerRows[0].id;
        const isProduction = process.env.NODE_ENV === 'production';
        const [applications] = await pool.query(`
            SELECT a.*, u.name as applicant_name, u.email, j.title as job_title,
                COALESCE(
                    CASE WHEN ? = 'production' AND a.resume_url LIKE 'http://localhost%' THEN NULL ELSE a.resume_url END,
                    jsp.resume_url
                ) as resume_url
            FROM applications a
            JOIN users u ON a.user_id = u.id
            JOIN jobs j ON a.job_id = j.id
            LEFT JOIN job_seeker_profile jsp ON a.user_id = jsp.user_id
            WHERE j.employer_id = ?
            ORDER BY a.applied_at DESC
        `, [isProduction ? 'production' : 'development', employerId]);

        res.status(200).json({ success: true, count: applications.length, data: applications });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getEmployerJobs = async (req, res) => {
    try {
        const [employerRows] = await pool.query('SELECT id FROM employer_profile WHERE user_id = ?', [req.user.id]);
        if (employerRows.length === 0) return res.status(200).json({ success: true, count: 0, data: [] });
        
        const employerId = employerRows[0].id;
        
        const [jobs] = await pool.query(`
            SELECT * FROM jobs 
            WHERE employer_id = ? 
            ORDER BY created_at DESC
        `, [employerId]);

        res.status(200).json({ success: true, count: jobs.length, data: jobs });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error fetching employer jobs' });
    }
};
