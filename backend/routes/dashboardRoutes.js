const express = require('express');
const {
  getDashboardStats,
  getRecentProjects,
  getDashboardMyTasks,
  getProductivity,
} = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/stats', getDashboardStats);
router.get('/recent-projects', getRecentProjects);
router.get('/my-tasks', getDashboardMyTasks);
router.get('/productivity', getProductivity);

module.exports = router;
