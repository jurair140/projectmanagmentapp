const mongoose = require('mongoose');
const Project = require('../models/Project');

/**
 * Check if a user ID is the project owner or a member.
 */
const isProjectOwner = (project, userId) => {
  const ownerId = project.owner?._id ? project.owner._id : project.owner;
  return String(ownerId) === String(userId);
};

const isProjectMember = (project, userId) => {
  if (isProjectOwner(project, userId)) return true;
  return (project.members || []).some((m) => {
    const memberId = m?._id ? m._id : m;
    return String(memberId) === String(userId);
  });
};

/**
 * Middleware: require the authenticated user to be the project owner or a project member.
 */
const requireProjectAccess = async (req, res, next) => {
  try {
    const projectId = req.params.id || req.params.projectId || req.body.project;
    if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ success: false, message: 'Invalid project ID' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (!isProjectMember(project, req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to access this project',
      });
    }

    req.project = project;
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Middleware: require the authenticated user to be the project owner.
 */
const requireProjectOwner = async (req, res, next) => {
  try {
    const projectId = req.params.id || req.params.projectId;
    if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ success: false, message: 'Invalid project ID' });
    }

    const project = req.project || (await Project.findById(projectId));
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (!isProjectOwner(project, req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Only the project owner can perform this action',
      });
    }

    req.project = project;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = {
  isProjectOwner,
  isProjectMember,
  requireProjectAccess,
  requireProjectOwner,
};
