const express = require('express');
const router = express.Router();
const { buildResume, analyzeResume, interviewCoach, generateJobDescription, jobMatch } = require('../controllers/aiController');
const { generateResumePDF } = require('../controllers/pdfController');
const { protect } = require('../middleware/auth');

router.post('/resume-generate', protect, buildResume);
router.post('/resume-analyze', protect, analyzeResume);
router.post('/resume-pdf', protect, generateResumePDF);
router.post('/interview-coach', protect, interviewCoach);
router.post('/job-description', protect, generateJobDescription);
router.get('/job-match', protect, jobMatch);

module.exports = router;
