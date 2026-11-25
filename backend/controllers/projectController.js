const mongoose = require('mongoose');
const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { calculateProjectStats } = require('../utils/calculateProgress');
const { isProjectOwner } = require('../middleware/projectPermission');
const { createNotification } = require('../utils/notificationHelper');

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const enrichProjectResponse = async (projectDoc) => {
  const project = projectDoc.toObject ? projectDoc.toObject() : projectDoc;
  const tasks = await Task.find({ project: project._id })
    .select('status dueDate assignedTo')
    .lean();
  const stats = calculateProjectStats(tasks, project.status);

  const memberTaskCounts = {};
  for (const task of tasks) {
    if (task.assignedTo) {
      const key = String(task.assignedTo);
      memberTaskCounts[key] = (memberTaskCounts[key] || 0) + 1;
    }
  }

  return {
    ...project,
    ...stats,
    memberTaskCounts,
  };
};

/**
 * @desc    Create a new project
 * @route   POST /api/projects
 * @access  Private
 */
const createProject = async (req, res, next) => {
  try {
    const { name, description, startDate, endDate, status } = req.body;

    const project = await Project.create({
      name,
      description: description || '',
      owner: req.user._id,
      members: [],
      startDate,
      endDate,
      status: status || 'Planning',
    });

    await project.populate([
      { path: 'owner', select: 'name email avatar' },
      { path: 'members', select: 'name email avatar' },
    ]);

    const enriched = await enrichProjectResponse(project);

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      project: enriched,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get all accessible projects with search, status filter, sort, and pagination
 * @route   GET /api/projects
 * @access  Private
 */
const getProjects = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const {
      search = '',
      status = '',
      sortBy = 'updatedAt',
      sortOrder = 'desc',
      page = 1,
      limit = 12,
    } = req.query;

    const filter = {
      $or: [{ owner: userId }, { members: userId }],
    };

    if (status && status !== 'All') {
      filter.status = status;
    }

    if (search.trim()) {
      const regex = new RegExp(escapeRegex(search.trim()), 'i');
      filter.$and = [{ $or: [{ name: regex }, { description: regex }] }];
    }

    const allowedSortFields = {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
      endDate: 'endDate',
      deadline: 'endDate',
      name: 'name',
    };
    const sortField = allowedSortFields[sortBy] || 'updatedAt';
    const sortDir = sortOrder === 'asc' ? 1 : -1;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
    const skip = (pageNum - 1) * limitNum;

    const [total, projects] = await Promise.all([
      Project.countDocuments(filter),
      Project.find(filter)
        .populate('owner', 'name email avatar')
        .populate('members', 'name email avatar')
        .sort({ [sortField]: sortDir })
        .skip(skip)
        .limit(limitNum)
        .lean(),
    ]);

    const projectIds = projects.map((p) => p._id);
    const tasks = await Task.find({ project: { $in: projectIds } })
      .select('project status dueDate assignedTo')
      .lean();

    const tasksByProject = new Map();
    for (const task of tasks) {
      const pid = String(task.project);
      if (!tasksByProject.has(pid)) tasksByProject.set(pid, []);
      tasksByProject.get(pid).push(task);
    }

    const enrichedProjects = projects.map((project) => {
      const projectTasks = tasksByProject.get(String(project._id)) || [];
      const stats = calculateProjectStats(projectTasks, project.status);
      return {
        ...project,
        ...stats,
      };
    });

    res.status(200).json({
      success: true,
      projects: enrichedProjects,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get single project details with stats and member task counts
 * @route   GET /api/projects/:id
 * @access  Private (Project Owner or Member)
 */
const getProjectById = async (req, res, next) => {
  try {
    await req.project.populate([
      { path: 'owner', select: 'name email avatar' },
      { path: 'members', select: 'name email avatar' },
    ]);

    const enriched = await enrichProjectResponse(req.project);

    res.status(200).json({
      success: true,
      project: enriched,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update project details
 * @route   PUT /api/projects/:id
 * @access  Private (Project Owner only)
 */
const updateProject = async (req, res, next) => {
  try {
    const project = req.project;
    const { name, description, startDate, endDate, status } = req.body;

    const nextStart = startDate ? new Date(startDate) : project.startDate;
    const nextEnd = endDate ? new Date(endDate) : project.endDate;
    if (nextEnd < nextStart) {
      return res.status(400).json({
        success: false,
        message: 'End date cannot be earlier than start date',
      });
    }

    if (name !== undefined) project.name = name;
    if (description !== undefined) project.description = description;
    if (startDate !== undefined) project.startDate = startDate;
    if (endDate !== undefined) project.endDate = endDate;
    if (status !== undefined) project.status = status;

    await project.save();
    await project.populate([
      { path: 'owner', select: 'name email avatar' },
      { path: 'members', select: 'name email avatar' },
    ]);

    const enriched = await enrichProjectResponse(project);

    res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      project: enriched,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Delete project and its tasks/notifications
 * @route   DELETE /api/projects/:id
 * @access  Private (Project Owner only)
 */
const deleteProject = async (req, res, next) => {
  try {
    const project = req.project;

    await Promise.all([
      Task.deleteMany({ project: project._id }),
      Notification.deleteMany({ relatedProject: project._id }),
      project.deleteOne(),
    ]);

    res.status(200).json({
      success: true,
      message: 'Project deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Add a registered user to project members
 * @route   POST /api/projects/:id/members
 * @access  Private (Project Owner only)
 */
const addProjectMember = async (req, res, next) => {
  try {
    const project = req.project;
    const { email, userId } = req.body;

    const user = userId
      ? await User.findById(userId).select('name email avatar')
      : await User.findOne({ email: email.toLowerCase() }).select('name email avatar');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No registered user found with that email',
      });
    }

    if (isProjectOwner(project, user._id)) {
      return res.status(400).json({
        success: false,
        message: 'Project owner is already part of the project',
      });
    }

    const alreadyMember = project.members.some((m) => String(m) === String(user._id));
    if (alreadyMember) {
      return res.status(400).json({
        success: false,
        message: 'User is already a member of this project',
      });
    }

    project.members.push(user._id);
    await project.save();

    await createNotification({
      recipient: user._id,
      message: `${req.user.name} added you to project "${project.name}".`,
      type: 'added_to_project',
      relatedProject: project._id,
    });

    await project.populate([
      { path: 'owner', select: 'name email avatar' },
      { path: 'members', select: 'name email avatar' },
    ]);

    const enriched = await enrichProjectResponse(project);

    res.status(200).json({
      success: true,
      message: `${user.name} added to project`,
      project: enriched,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Remove a member from a project
 * @route   DELETE /api/projects/:id/members/:userId
 * @access  Private (Project Owner only)
 */
const removeProjectMember = async (req, res, next) => {
  try {
    const project = req.project;
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }

    if (isProjectOwner(project, userId)) {
      return res.status(400).json({
        success: false,
        message: 'Project owner cannot remove themselves while owning the project',
      });
    }

    const exists = project.members.some((m) => String(m) === String(userId));
    if (!exists) {
      return res.status(404).json({
        success: false,
        message: 'User is not a member of this project',
      });
    }

    project.members = project.members.filter((m) => String(m) !== String(userId));
    await project.save();

    // Unassign tasks in this project that were assigned to the removed member
    await Task.updateMany(
      { project: project._id, assignedTo: userId },
      { $set: { assignedTo: null } }
    );

    await project.populate([
      { path: 'owner', select: 'name email avatar' },
      { path: 'members', select: 'name email avatar' },
    ]);

    const enriched = await enrichProjectResponse(project);

    res.status(200).json({
      success: true,
      message: 'Member removed from project',
      project: enriched,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addProjectMember,
  removeProjectMember,
};
