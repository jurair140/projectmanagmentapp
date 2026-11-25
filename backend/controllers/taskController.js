const mongoose = require('mongoose');
const Task = require('../models/Task');
const Project = require('../models/Project');
const Notification = require('../models/Notification');
const { isProjectMember } = require('../middleware/projectPermission');
const {
  getStartOfToday,
  getTaskDeadlineFlags,
  calculateProjectStats,
} = require('../utils/calculateProgress');
const {
  createNotification,
  syncUpcomingDeadlineNotifications,
} = require('../utils/notificationHelper');

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const formatTask = (taskDoc) => {
  const task = taskDoc.toObject ? taskDoc.toObject() : taskDoc;
  const flags = getTaskDeadlineFlags(task);
  return {
    ...task,
    ...flags,
  };
};

const getAccessibleProjectIds = async (userId) => {
  const projects = await Project.find({
    $or: [{ owner: userId }, { members: userId }],
  })
    .select('_id')
    .lean();
  return projects.map((p) => p._id);
};

const buildTaskQuery = (query, allowedProjectIds) => {
  const filter = {
    project: { $in: allowedProjectIds },
  };

  if (query.project && mongoose.Types.ObjectId.isValid(query.project)) {
    const isAllowed = allowedProjectIds.some((id) => String(id) === String(query.project));
    filter.project = isAllowed ? query.project : { $in: [] };
  }

  if (query.status && query.status !== 'All') {
    filter.status = query.status;
  }

  if (query.priority && query.priority !== 'All') {
    filter.priority = query.priority;
  }

  if (query.assignedTo && query.assignedTo !== 'All') {
    if (query.assignedTo === 'unassigned') {
      filter.assignedTo = null;
    } else if (mongoose.Types.ObjectId.isValid(query.assignedTo)) {
      filter.assignedTo = query.assignedTo;
    }
  }

  if (query.search && query.search.trim()) {
    const regex = new RegExp(escapeRegex(query.search.trim()), 'i');
    filter.title = regex;
  }

  if (query.dueDate) {
    const todayStart = getStartOfToday();
    if (query.dueDate === 'overdue') {
      filter.dueDate = { $lt: todayStart };
      filter.status = { $ne: 'Completed' };
    } else if (query.dueDate === 'dueSoon') {
      const threeDaysEnd = new Date(todayStart);
      threeDaysEnd.setUTCDate(threeDaysEnd.getUTCDate() + 3);
      threeDaysEnd.setUTCHours(23, 59, 59, 999);
      filter.dueDate = { $gte: todayStart, $lte: threeDaysEnd };
      filter.status = { $ne: 'Completed' };
    } else if (query.dueDate === 'today') {
      const todayEnd = new Date(todayStart);
      todayEnd.setUTCHours(23, 59, 59, 999);
      filter.dueDate = { $gte: todayStart, $lte: todayEnd };
    } else if (/^\d{4}-\d{2}-\d{2}$/.test(query.dueDate)) {
      const dayStart = new Date(`${query.dueDate}T00:00:00.000Z`);
      const dayEnd = new Date(`${query.dueDate}T23:59:59.999Z`);
      filter.dueDate = { $gte: dayStart, $lte: dayEnd };
    }
  }

  return filter;
};

const queryTasksWithPagination = async (filter, query) => {
  const { sortBy = 'createdAt', sortOrder = 'desc', page = 1, limit = 50 } = query;

  const allowedSortFields = {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    dueDate: 'dueDate',
    priority: 'priority',
    status: 'status',
    title: 'title',
  };
  const sortField = allowedSortFields[sortBy] || 'createdAt';
  const sortDir = sortOrder === 'asc' ? 1 : -1;

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
  const skip = (pageNum - 1) * limitNum;

  const [total, tasks] = await Promise.all([
    Task.countDocuments(filter),
    Task.find(filter)
      .populate('project', 'name status owner members')
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .sort({ [sortField]: sortDir })
      .skip(skip)
      .limit(limitNum)
      .lean(),
  ]);

  return {
    tasks: tasks.map(formatTask),
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1,
    },
  };
};

/**
 * @desc    Create a new task inside a project
 * @route   POST /api/tasks
 * @access  Private (Project Owner or Member)
 */
const createTask = async (req, res, next) => {
  try {
    const { title, description, project: projectId, assignedTo, priority, status, startDate, dueDate } =
      req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (!isProjectMember(project, req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'You must be a member of this project to create tasks',
      });
    }

    if (assignedTo) {
      if (!isProjectMember(project, assignedTo)) {
        return res.status(400).json({
          success: false,
          message: 'Task can only be assigned to an existing member of this project',
        });
      }
    }

    const task = await Task.create({
      title,
      description: description || '',
      project: project._id,
      assignedTo: assignedTo || null,
      createdBy: req.user._id,
      priority: priority || 'Medium',
      status: status || 'To Do',
      startDate: startDate || null,
      dueDate,
    });

    if (assignedTo && String(assignedTo) !== String(req.user._id)) {
      await createNotification({
        recipient: assignedTo,
        message: `${req.user.name} assigned you the task "${task.title}" in "${project.name}".`,
        type: 'task_assigned',
        relatedProject: project._id,
        relatedTask: task._id,
      });
    }

    await task.populate([
      { path: 'project', select: 'name status' },
      { path: 'assignedTo', select: 'name email avatar' },
      { path: 'createdBy', select: 'name email avatar' },
    ]);

    const projectTasks = await Task.find({ project: project._id }).select('status dueDate').lean();
    const projectStats = calculateProjectStats(projectTasks, project.status);

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      task: formatTask(task),
      projectStats,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get tasks across accessible projects with filtering & pagination
 * @route   GET /api/tasks
 * @access  Private
 */
const getTasks = async (req, res, next) => {
  try {
    await syncUpcomingDeadlineNotifications(req.user._id);
    const allowedProjectIds = await getAccessibleProjectIds(req.user._id);
    const filter = buildTaskQuery(req.query, allowedProjectIds);
    const result = await queryTasksWithPagination(filter, req.query);

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get tasks assigned to the current user
 * @route   GET /api/tasks/my-tasks
 * @access  Private
 */
const getMyTasks = async (req, res, next) => {
  try {
    await syncUpcomingDeadlineNotifications(req.user._id);
    const allowedProjectIds = await getAccessibleProjectIds(req.user._id);
    const filter = buildTaskQuery(req.query, allowedProjectIds);
    filter.assignedTo = req.user._id;

    const result = await queryTasksWithPagination(filter, req.query);

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get tasks belonging to a specific project
 * @route   GET /api/projects/:id/tasks
 * @access  Private (Project Owner or Member)
 */
const getProjectTasks = async (req, res, next) => {
  try {
    const projectId = req.project._id;
    const filter = buildTaskQuery(req.query, [projectId]);
    filter.project = projectId;

    const result = await queryTasksWithPagination(filter, req.query);

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get single task details
 * @route   GET /api/tasks/:id
 * @access  Private (Project Owner or Member)
 */
const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('project', 'name status owner members')
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar');

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    if (!isProjectMember(task.project, req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this task',
      });
    }

    res.status(200).json({
      success: true,
      task: formatTask(task),
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update task details, assignee, priority, or status
 * @route   PUT /api/tasks/:id
 * @access  Private (Project Owner or Member)
 */
const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const project = await Project.findById(task.project);
    if (!project || !isProjectMember(project, req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to modify this task',
      });
    }

    const { title, description, assignedTo, priority, status, startDate, dueDate } = req.body;

    if (assignedTo !== undefined && assignedTo !== null && assignedTo !== '') {
      if (!isProjectMember(project, assignedTo)) {
        return res.status(400).json({
          success: false,
          message: 'Task can only be assigned to an existing member of this project',
        });
      }
    }

    const nextStart = startDate !== undefined ? (startDate ? new Date(startDate) : null) : task.startDate;
    const nextDue = dueDate !== undefined ? new Date(dueDate) : task.dueDate;
    if (nextStart && nextDue < nextStart) {
      return res.status(400).json({
        success: false,
        message: 'Due date cannot be earlier than start date',
      });
    }

    const previousAssignee = task.assignedTo ? String(task.assignedTo) : null;
    const previousStatus = task.status;

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (assignedTo !== undefined) task.assignedTo = assignedTo || null;
    if (priority !== undefined) task.priority = priority;
    if (status !== undefined) task.status = status;
    if (startDate !== undefined) task.startDate = startDate || null;
    if (dueDate !== undefined) task.dueDate = dueDate;

    await task.save();

    const newAssignee = task.assignedTo ? String(task.assignedTo) : null;
    if (newAssignee && newAssignee !== previousAssignee && newAssignee !== String(req.user._id)) {
      await createNotification({
        recipient: newAssignee,
        message: `${req.user.name} assigned you the task "${task.title}" in "${project.name}".`,
        type: 'task_assigned',
        relatedProject: project._id,
        relatedTask: task._id,
      });
    }

    if (previousStatus !== 'Completed' && task.status === 'Completed') {
      const recipients = new Set();
      if (String(project.owner) !== String(req.user._id)) {
        recipients.add(String(project.owner));
      }
      if (String(task.createdBy) !== String(req.user._id)) {
        recipients.add(String(task.createdBy));
      }
      for (const recipientId of recipients) {
        await createNotification({
          recipient: recipientId,
          message: `${req.user.name} completed task "${task.title}" in "${project.name}".`,
          type: 'task_completed',
          relatedProject: project._id,
          relatedTask: task._id,
        });
      }
    }

    await task.populate([
      { path: 'project', select: 'name status' },
      { path: 'assignedTo', select: 'name email avatar' },
      { path: 'createdBy', select: 'name email avatar' },
    ]);

    const projectTasks = await Task.find({ project: project._id }).select('status dueDate').lean();
    const projectStats = calculateProjectStats(projectTasks, project.status);

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      task: formatTask(task),
      projectStats,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Delete a task
 * @route   DELETE /api/tasks/:id
 * @access  Private (Project Owner or Member)
 */
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const project = await Project.findById(task.project);
    if (!project || !isProjectMember(project, req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this task',
      });
    }

    await Promise.all([
      Notification.deleteMany({ relatedTask: task._id }),
      task.deleteOne(),
    ]);

    const projectTasks = await Task.find({ project: project._id }).select('status dueDate').lean();
    const projectStats = calculateProjectStats(projectTasks, project.status);

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
      projectStats,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createTask,
  getTasks,
  getMyTasks,
  getProjectTasks,
  getTaskById,
  updateTask,
  deleteTask,
};
