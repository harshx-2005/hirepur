const Job = require('../models/Job');
const { pool } = require('../config/db');

exports.getJobs = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 9; // Default to 9 for 3x3 grid
        
        const filters = {
             title: req.query.search,
             location: req.query.location,
             job_type: req.query.job_type
        };
        
        const jobs = await Job.findAll(filters, page, limit);
        const total = await Job.countAll(filters);
        
        res.status(200).json({ 
            success: true, 
            data: jobs,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                currentPage: page,
                limit
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error fetching jobs' });
    }
};

exports.getJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }
        res.status(200).json({ success: true, data: job });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.createJob = async (req, res) => {
    try {
        // Fetch employer ID based on authenticated user
        const [employerRows] = await pool.query('SELECT id FROM employer_profile WHERE user_id = ?', [req.user.id]);
        if (employerRows.length === 0) {
            return res.status(403).json({ success: false, message: 'Only employers can post jobs' });
        }
        
        const employerId = employerRows[0].id;
        const jobId = await Job.create(employerId, req.body);
        
        res.status(201).json({ success: true, message: 'Job created successfully', data: { id: jobId } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error creating job' });
    }
};

exports.updateJob = async (req, res) => {
    try {
        const jobId = req.params.id;
        // Verify ownership
        const job = await Job.findById(jobId);
        if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

        const [employerRows] = await pool.query('SELECT id FROM employer_profile WHERE user_id = ?', [req.user.id]);
        if (employerRows.length === 0 || job.employer_id !== employerRows[0].id) {
            return res.status(403).json({ success: false, message: 'Not authorized to update this job' });
        }

        await Job.update(jobId, req.body);
        res.status(200).json({ success: true, message: 'Job updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error updating job' });
    }
};

exports.deleteJob = async (req, res) => {
    try {
        const jobId = req.params.id;
        
        const job = await Job.findById(jobId);
        if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

        const [employerRows] = await pool.query('SELECT id FROM employer_profile WHERE user_id = ?', [req.user.id]);
        if (employerRows.length === 0 || job.employer_id !== employerRows[0].id) {
            return res.status(403).json({ success: false, message: 'Not authorized to delete this job' });
        }

        await Job.delete(jobId);
        res.status(200).json({ success: true, message: 'Job deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error deleting job' });
    }
};
