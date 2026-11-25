const fs = require('fs');
const path = require('path');
const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const removeLocalAvatar = (avatarUrl) => {
  if (!avatarUrl || !avatarUrl.startsWith('/uploads/avatars/')) return;
  const filename = path.basename(avatarUrl);
  const fullPath = path.join(__dirname, '..', 'uploads', 'avatars', filename);
  if (fs.existsSync(fullPath)) {
    fs.unlink(fullPath, () => {});
  }
};

/**
 * @desc    Get user profile
 * @route   GET /api/users/profile
 * @access  Private
 */
const getProfile = async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
};

/**
 * @desc    Update user name and/or profile avatar
 * @route   PUT /api/users/profile
 * @access  Private
 */
const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (typeof req.body.name === 'string') {
      const trimmedName = req.body.name.trim();
      if (trimmedName.length < 2 || trimmedName.length > 80) {
        return res.status(400).json({
          success: false,
          message: 'Full name must be between 2 and 80 characters',
        });
      }
      user.name = trimmedName;
    }

    if (req.file) {
      removeLocalAvatar(user.avatar);
      user.avatar = `/uploads/avatars/${req.file.filename}`;
    } else if (req.body.removeAvatar === 'true' || req.body.removeAvatar === true) {
      removeLocalAvatar(user.avatar);
      user.avatar = '';
    } else if (typeof req.body.avatar === 'string' && req.body.avatar.trim()) {
      const candidate = req.body.avatar.trim();
      if (!/^https?:\/\/.+/i.test(candidate) && !candidate.startsWith('/uploads/')) {
        return res.status(400).json({
          success: false,
          message: 'Avatar must be a valid HTTP/HTTPS URL or uploaded image',
        });
      }
      user.avatar = candidate;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: user.toSafeJSON(),
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Search registered users by email
 * @route   GET /api/users/search?email=
 * @access  Private
 */
const searchUsers = async (req, res, next) => {
  try {
    const emailQuery = (req.query.email || '').trim();
    if (emailQuery.length < 2) {
      return res.status(200).json({
        success: true,
        users: [],
      });
    }

    const regex = new RegExp(escapeRegex(emailQuery), 'i');
    const users = await User.find({
      email: regex,
    })
      .select('_id name email avatar')
      .limit(10)
      .lean();

    res.status(200).json({
      success: true,
      users,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get team collaborators across user's accessible projects with assigned task counts
 * @route   GET /api/users/team
 * @access  Private
 */
const getTeamOverview = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const projects = await Project.find({
      $or: [{ owner: userId }, { members: userId }],
    })
      .populate('owner', 'name email avatar')
      .populate('members', 'name email avatar')
      .lean();

    const projectIds = projects.map((p) => p._id);
    const tasks = await Task.find({ project: { $in: projectIds } })
      .select('project assignedTo status')
      .lean();

    const collaboratorMap = new Map();

    const registerUser = (userObj, project, role) => {
      if (!userObj || !userObj._id) return;
      const key = String(userObj._id);
      if (!collaboratorMap.has(key)) {
        collaboratorMap.set(key, {
          _id: userObj._id,
          name: userObj.name,
          email: userObj.email,
          avatar: userObj.avatar,
          projects: [],
          assignedTasks: 0,
          completedTasks: 0,
        });
      }
      const entry = collaboratorMap.get(key);
      if (!entry.projects.some((p) => String(p._id) === String(project._id))) {
        entry.projects.push({
          _id: project._id,
          name: project.name,
          role,
        });
      }
    };

    for (const project of projects) {
      registerUser(project.owner, project, 'Owner');
      for (const member of project.members || []) {
        registerUser(member, project, 'Member');
      }
    }

    for (const task of tasks) {
      if (!task.assignedTo) continue;
      const key = String(task.assignedTo);
      const entry = collaboratorMap.get(key);
      if (entry) {
        entry.assignedTasks += 1;
        if (task.status === 'Completed') {
          entry.completedTasks += 1;
        }
      }
    }

    res.status(200).json({
      success: true,
      members: Array.from(collaboratorMap.values()),
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  searchUsers,
  getTeamOverview,
};
