// Local test accounts for checking pages behind login. Run: node database/seed-test-users.js
// Safe to re-run: existing test users are left as they are. Never run against production.
const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');
const User = require('../models/User');

const PASSWORD = 'Metro-test-2611';
const SEEKER = { name: 'Test Seeker', email: 'seeker@hirepur.test', role: 'job_seeker' };
const EMPLOYER = { name: 'Test Employer', email: 'employer@hirepur.test', role: 'employer' };

const ensureUser = async (u, hash) => {
    const existing = await User.findByEmail(u.email);
    if (existing) return existing.id;
    const id = await User.create({ ...u, password: hash, is_verified: 1 });
    if (u.role === 'job_seeker') await User.createJobSeekerProfile(id);
    else await User.createEmployerProfile(id, { company_name: 'Metro Test Co', location: 'Pune' });
    return id;
};

(async () => {
    const hash = await bcrypt.hash(PASSWORD, 10);
    const seekerId = await ensureUser(SEEKER, hash);
    const employerUserId = await ensureUser(EMPLOYER, hash);

    // one job from the test employer, and the test seeker's applications at different stops
    const [[profile]] = await pool.query('SELECT id FROM employer_profile WHERE user_id = ?', [employerUserId]);
    let [[job]] = await pool.query('SELECT id FROM jobs WHERE employer_id = ? LIMIT 1', [profile.id]);
    if (!job) {
        const [r] = await pool.query(
            'INSERT INTO jobs (employer_id, title, description, salary_range, job_type, work_mode, location, skills_required) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [profile.id, 'Test Frontend Developer', 'Test listing for checking the app locally.', '8 LPA - 12 LPA', 'Full-time', 'Hybrid', 'Pune', JSON.stringify(['React', 'CSS'])]
        );
        job = { id: r.insertId };
    }
    const [[hasApps]] = await pool.query('SELECT COUNT(*) AS n FROM applications WHERE user_id = ?', [seekerId]);
    if (!hasApps.n) {
        const [others] = await pool.query('SELECT id FROM jobs WHERE id <> ? ORDER BY id LIMIT 2', [job.id]);
        const rows = [[job.id, 'interview'], ...others.map((o, i) => [o.id, ['under_review', 'rejected'][i]])];
        for (const [jobId, status] of rows) {
            await pool.query('INSERT INTO applications (job_id, user_id, status) VALUES (?, ?, ?)', [jobId, seekerId, status]);
        }
    }

    console.log(`Test accounts ready: ${SEEKER.email}, ${EMPLOYER.email} (password in this file)`);
    await pool.end();
})().catch(async (err) => {
    console.error(err);
    await pool.end();
    process.exit(1);
});
