const express = require('express');
const router = express.Router();
const { getStats, getAllUsers, getAllJobs, deleteUser, deleteJob, updateUserRole } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// All routes here are admin only
router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getStats);
router.get('/users', getAllUsers);
router.get('/jobs', getAllJobs);

router.delete('/users/:id', deleteUser);
router.delete('/jobs/:id', deleteJob);
router.put('/users/:id/role', updateUserRole);

module.exports = router;
