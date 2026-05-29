const { pool } = require('../config/db');
const User = require('../models/User');

exports.getProfile = async (req, res) => {
    try {
        // Allow any authenticated user to check their profile, 
        // but only return JOB_SEEKER_PROFILE data if they are a job seeker.
        if (req.user.role === 'job_seeker') {
            const [rows] = await pool.query('SELECT * FROM job_seeker_profile WHERE user_id = ?', [req.user.id]);
            
            if (rows.length === 0) {
                await pool.query('INSERT INTO job_seeker_profile (user_id) VALUES (?)', [req.user.id]);
                const [newRows] = await pool.query('SELECT * FROM job_seeker_profile WHERE user_id = ?', [req.user.id]);
                return res.status(200).json({ success: true, data: newRows[0] });
            }
            return res.status(200).json({ success: true, data: rows[0] });
        } else if (req.user.role === 'employer') {
            const [rows] = await pool.query('SELECT * FROM employer_profile WHERE user_id = ?', [req.user.id]);
            if (rows.length === 0) {
                // This shouldn't happen if registration is correct, but safe fallback
                return res.status(200).json({ success: true, data: { company_name: req.user.name } });
            }
            return res.status(200).json({ success: true, data: rows[0] });
        }

        res.status(200).json({ success: true, data: { name: req.user.name, email: req.user.email, role: req.user.role } });
    } catch (error) {
        console.error('Get Profile Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        if (req.user.role === 'job_seeker') {
            const { phone, headline, summary, skills, experience, education, projects, location, linkedin, portfolio, resume_url } = req.body;
            await pool.query(
                `UPDATE job_seeker_profile SET 
                phone = ?,
                headline = ?, 
                summary = ?,
                skills = ?, 
                experience = ?, 
                education = ?, 
                projects = ?,
                location = ?, 
                linkedin = ?, 
                portfolio = ?,
                resume_url = ?
                WHERE user_id = ?`,
                [
                    phone,
                    headline, 
                    summary,
                    JSON.stringify(skills), 
                    JSON.stringify(experience), 
                    JSON.stringify(education), 
                    JSON.stringify(projects),
                    location, 
                    linkedin, 
                    portfolio,
                    resume_url || null,
                    req.user.id
                ]
            );
        } else if (req.user.role === 'employer') {
            const { company_name, company_website, company_size, industry, company_description, location } = req.body;
            await pool.query(
                `UPDATE employer_profile SET 
                company_name = ?,
                company_website = ?,
                company_size = ?,
                industry = ?,
                company_description = ?,
                location = ?
                WHERE user_id = ?`,
                [company_name, company_website, company_size, industry, company_description, location, req.user.id]
            );
        } else {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        res.status(200).json({ success: true, message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Update Profile Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.updateProfilePic = async (req, res) => {
    try {
        const { profile_pic } = req.body;
        if (!profile_pic) {
            return res.status(400).json({ success: false, message: 'Profile picture URL is required' });
        }

        await pool.query('UPDATE users SET profile_pic = ? WHERE id = ?', [profile_pic, req.user.id]);

        res.status(200).json({ success: true, message: 'Profile picture updated', profile_pic });
    } catch (error) {
        console.error('Update Profile Pic Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        let profileData = {};
        if (user.role === 'job_seeker') {
            const [rows] = await pool.query('SELECT * FROM job_seeker_profile WHERE user_id = ?', [user.id]);
            profileData = rows.length ? rows[0] : {};
        } else if (user.role === 'employer') {
            const [rows] = await pool.query('SELECT * FROM employer_profile WHERE user_id = ?', [user.id]);
            profileData = rows.length ? rows[0] : {};
        }

        res.status(200).json({ 
            success: true, 
            data: { 
                id: user.id, 
                name: user.name, 
                email: user.email, 
                role: user.role, 
                profile_pic: user.profile_pic,
                profile: profileData
            } 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
