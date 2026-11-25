const express = require('express');
const {
  getProfile,
  updateProfile,
  searchUsers,
  getTeamOverview,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { uploadAvatar } = require('../middleware/uploadMiddleware');

const router = express.Router();

router.use(protect);

router.get('/profile', getProfile);
router.put('/profile', uploadAvatar.single('avatar'), updateProfile);
router.get('/search', searchUsers);
router.get('/team', getTeamOverview);

module.exports = router;
