const Job = require('../models/Job');
const Application = require('../models/Application');
const { pool } = require('../config/db');
const { sendApplicationStatusUpdate } = require('../services/emailService');

exports.applyForJob = async (req, res) => {
    try {
        const { cover_letter } = req.body;
        const job_id = req.params.jobId;
        const user_id = req.user.id;

        // Verify if job exists
        const job = await Job.findById(job_id);
        if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

        // Verify role
        if (req.user.role !== 'job_seeker') {
            return res.status(403).json({ success: false, message: 'Only job seekers can apply' });
        }

        // Ideally resume upload is handled separately and url is passed, or handled via multer in this route.
        // Assuming resume_url is part of body for now.
        const resume_url = req.body.resume_url || req.file?.path || null;

        const applicationId = await Application.create({ job_id, user_id, resume_url, cover_letter });

        // Real-time Notification Gating: Notify the Employer
        try {
            const message = `${req.user.name} applied for your job: ${job.title}`;
            const [notifResult] = await pool.query(
                `INSERT INTO NOTIFICATIONS (user_id, message, type, related_id) 
                 VALUES (?, ?, 'application', ?)`,
                [job.employer_user_id, message, job.id]
            );
            
            const notifObj = {
                id: notifResult.insertId,
                message,
                type: 'application',
                related_id: job.id,
                is_read: 0,
                created_at: new Date()
            };

            if (req.io) {
                req.io.to(`user_${job.employer_user_id}`).emit('receive_notification', notifObj);
            }
        } catch (notifErr) {
            console.error('⚠️ Live Notification Dispatch Error:', notifErr.message);
        }

        res.status(201).json({ success: true, message: 'Application submitted', data: { id: applicationId } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error during application' });
    }
};

exports.getUserApplications = async (req, res) => {
    try {
        if (req.user.role !== 'job_seeker') {
             return res.status(403).json({ success: false, message: 'Access denied' });
        }
        const applications = await Application.findByUser(req.user.id);
        res.status(200).json({ success: true, count: applications.length, data: applications });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error fetching applications' });
    }
};

exports.getJobApplications = async (req, res) => {
    try {
        const job_id = req.params.jobId;
        const job = await Job.findById(job_id);
        if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

        // Verify employer owns job
        const [employerRows] = await pool.query('SELECT id FROM EMPLOYER_PROFILE WHERE user_id = ?', [req.user.id]);
        if (employerRows.length === 0 || job.employer_id !== employerRows[0].id) {
            return res.status(403).json({ success: false, message: 'Not authorized to view these applications' });
        }

        const applications = await Application.findByJob(job_id);
        res.status(200).json({ success: true, count: applications.length, data: applications });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error fetching job applications' });
    }
};

exports.updateApplicationStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const applicationId = req.params.id;

        const application = await Application.findById(applicationId);
        if (!application) return res.status(404).json({ success: false, message: 'Application not found' });

        const job = await Job.findById(application.job_id);

        // Verify employer owns job
        const [employerRows] = await pool.query('SELECT id FROM EMPLOYER_PROFILE WHERE user_id = ?', [req.user.id]);
        if (employerRows.length === 0 || job.employer_id !== employerRows[0].id) {
            return res.status(403).json({ success: false, message: 'Not authorized to update this application' });
        }


        await Application.updateStatus(applicationId, status);

        // Real-time Notification Gating: Notify the Candidate
        try {
            const formattedStatus = status.replace('_', ' ').toUpperCase();
            const message = `Your application for ${job.title} has been updated to: ${formattedStatus}`;
            const [notifResult] = await pool.query(
                `INSERT INTO NOTIFICATIONS (user_id, message, type, related_id) 
                 VALUES (?, ?, 'status_change', ?)`,
                [application.user_id, message, application.id]
            );
            
            const notifObj = {
                id: notifResult.insertId,
                message,
                type: 'status_change',
                related_id: application.id,
                is_read: 0,
                created_at: new Date()
            };

            if (req.io) {
                req.io.to(`user_${application.user_id}`).emit('receive_notification', notifObj);
            }
        } catch (notifErr) {
            console.error('⚠️ Status Notification Dispatch Error:', notifErr.message);
        }

        // Fetch applicant details for email
        const [userRows] = await pool.query('SELECT name, email FROM USERS WHERE id = ?', [application.user_id]);
        if (userRows.length > 0) {
            const applicant = userRows[0];
            // Fire and forget email notification to avoid blocking response
            sendApplicationStatusUpdate(applicant.email, applicant.name, job.title, status).catch(err => {
                console.error('Email Notification Error:', err);
            });
        }

        res.status(200).json({ success: true, message: 'Status updated' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error updating status' });
    }
};

exports.batchUpdateApplicationStatus = async (req, res) => {
    try {
        const { ids, status } = req.body;
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ success: false, message: 'Invalid or empty IDs' });
        }

        // Verify employer owns the jobs for all applications
        const [employerRows] = await pool.query('SELECT id FROM EMPLOYER_PROFILE WHERE user_id = ?', [req.user.id]);
        if (employerRows.length === 0) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }
        const employerId = employerRows[0].id;

        // Fetch applications and their job owners
        const [rows] = await pool.query(`
            SELECT a.id, j.employer_id 
            FROM APPLICATIONS a 
            JOIN JOBS j ON a.job_id = j.id 
            WHERE a.id IN (?)
        `, [ids]);

        const unauthorized = rows.some(row => row.employer_id !== employerId);
        if (unauthorized || rows.length !== ids.length) {
            return res.status(403).json({ success: false, message: 'Not authorized for some applications or IDs invalid' });
        }

        await pool.query('UPDATE APPLICATIONS SET status = ? WHERE id IN (?)', [status, ids]);

        // Send emails in background
        const [userRows] = await pool.query(`
            SELECT u.name, u.email, j.title 
            FROM APPLICATIONS a 
            JOIN USERS u ON a.user_id = u.id 
            JOIN JOBS j ON a.job_id = j.id 
            WHERE a.id IN (?)
        `, [ids]);

        userRows.forEach(applicant => {
            sendApplicationStatusUpdate(applicant.email, applicant.name, applicant.title, status).catch(err => {
                console.error('Batch Email Notification Error:', err);
            });
        });

        res.status(200).json({ success: true, message: `Updated ${ids.length} applications` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error during batch update' });
    }
};
