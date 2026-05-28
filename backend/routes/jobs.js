const express = require('express');
const router = express.Router();
const { getJobs, getJob, createJob, updateJob, deleteJob } = require('../controllers/jobController');
const { protect } = require('../middleware/auth');

router.route('/')
    .get(getJobs)
    .post(protect, createJob);

router.route('/:id')
    .get(getJob)
    .put(protect, updateJob)
    .delete(protect, deleteJob);

module.exports = router;
