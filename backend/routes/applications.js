const express = require('express');
const router = express.Router();
const { applyForJob, getUserApplications, getJobApplications, updateApplicationStatus, batchUpdateApplicationStatus } = require('../controllers/applicationController');
const { protect } = require('../middleware/auth');

router.post('/job/:jobId', protect, applyForJob);
router.get('/user', protect, getUserApplications);
router.get('/job/:jobId', protect, getJobApplications);
router.put('/:id/status', protect, updateApplicationStatus);
router.put('/batch-status', protect, batchUpdateApplicationStatus);

module.exports = router;
