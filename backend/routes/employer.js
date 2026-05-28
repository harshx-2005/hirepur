const express = require('express');
const router = express.Router();
const { getDashboardStats, getEmployerApplications, getEmployerJobs } = require('../controllers/employerController');
const { protect } = require('../middleware/auth');

router.get('/dashboard', protect, getDashboardStats);
router.get('/applications', protect, getEmployerApplications);
router.get('/jobs', protect, getEmployerJobs);

module.exports = router;
