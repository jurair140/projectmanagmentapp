const Project = require('../models/Project');
const Task = require('../models/Task');
const { calculateProjectStats, getTaskDeadlineFlags } = require('../utils/calculateProgress');
const { syncUpcomingDeadlineNotifications } = require('../utils/notificationHelper');

const getAccessibleProjects = async (userId) =>
  Project.find({
    $or: [{ owner: userId }, { members: userId }],
  })
    .populate('owner', 'name email avatar')
    .populate('members', 'name email avatar')
    .sort({ updatedAt: -1 })
    .lean();

/**
 * @desc    Get dynamic dashboard statistics
 * @route   GET /api/dashboard/stats
 * @access  Private
 */
const getDashboardStats = async (req, res, next) => {
  try {
    const projects = await getAccessibleProjects(req.user._id);
    const projectIds = projects.map((p) => p._id);

    const tasks = await Task.find({ project: { $in: projectIds } })
      .select('status dueDate')
      .lean();

    const taskStats = calculateProjectStats(tasks);

    res.status(200).json({
      success: true,
      stats: {
        totalProjects: projects.length,
        activeProjects: projects.filter((p) => p.status === 'Active').length,
        totalTasks: taskStats.totalTasks,
        completedTasks: taskStats.completedTasks,
        pendingTasks: taskStats.pendingTasks,
        inProgressTasks: taskStats.inProgressTasks,
        todoTasks: taskStats.todoTasks,
        overdueTasks: taskStats.overdueTasks,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get recently updated accessible projects with calculated progress
 * @route   GET /api/dashboard/recent-projects
 * @access  Private
 */
const getRecentProjects = async (req, res, next) => {
  try {
    const projects = await Project.find({
      $or: [{ owner: req.user._id }, { members: req.user._id }],
    })
      .populate('owner', 'name email avatar')
      .populate('members', 'name email avatar')
      .sort({ updatedAt: -1 })
      .limit(5)
      .lean();

    const projectIds = projects.map((p) => p._id);
    const tasks = await Task.find({ project: { $in: projectIds } })
      .select('project status dueDate')
      .lean();

    const tasksByProject = new Map();
    for (const task of tasks) {
      const pid = String(task.project);
      if (!tasksByProject.has(pid)) tasksByProject.set(pid, []);
      tasksByProject.get(pid).push(task);
    }

    const recentProjects = projects.map((project) => {
      const projectTasks = tasksByProject.get(String(project._id)) || [];
      const stats = calculateProjectStats(projectTasks, project.status);
      return {
        ...project,
        ...stats,
      };
    });

    res.status(200).json({
      success: true,
      projects: recentProjects,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get current user's tasks and upcoming/overdue deadlines
 * @route   GET /api/dashboard/my-tasks
 * @access  Private
 */
const getDashboardMyTasks = async (req, res, next) => {
  try {
    await syncUpcomingDeadlineNotifications(req.user._id);

    const projects = await Project.find({
      $or: [{ owner: req.user._id }, { members: req.user._id }],
    })
      .select('_id')
      .lean();
    const projectIds = projects.map((p) => p._id);

    const [myRawTasks, allOpenTasks] = await Promise.all([
      Task.find({
        project: { $in: projectIds },
        assignedTo: req.user._id,
      })
        .populate('project', 'name status')
        .populate('assignedTo', 'name email avatar')
        .sort({ dueDate: 1 })
        .limit(8)
        .lean(),
      Task.find({
        project: { $in: projectIds },
        status: { $ne: 'Completed' },
      })
        .populate('project', 'name status')
        .populate('assignedTo', 'name email avatar')
        .sort({ dueDate: 1 })
        .lean(),
    ]);

    const myTasks = myRawTasks.map((task) => ({
      ...task,
      ...getTaskDeadlineFlags(task),
    }));

    const upcomingDeadlines = allOpenTasks
      .map((task) => ({
        ...task,
        ...getTaskDeadlineFlags(task),
      }))
      .filter((task) => task.isOverdue || task.isDueSoon)
      .slice(0, 8);

    res.status(200).json({
      success: true,
      myTasks,
      upcomingDeadlines,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get productivity chart breakdown (Completed, In Progress, Pending)
 * @route   GET /api/dashboard/productivity
 * @access  Private
 */
const getProductivity = async (req, res, next) => {
  try {
    const projects = await Project.find({
      $or: [{ owner: req.user._id }, { members: req.user._id }],
    })
      .select('_id')
      .lean();
    const projectIds = projects.map((p) => p._id);

    const tasks = await Task.find({ project: { $in: projectIds } })
      .select('status priority dueDate')
      .lean();

    const completed = tasks.filter((t) => t.status === 'Completed').length;
    const inProgress = tasks.filter((t) => t.status === 'In Progress').length;
    const pending = tasks.filter((t) => t.status === 'To Do').length;

    const statusData = [
      { name: 'Completed', count: completed, fill: '#10b981' },
      { name: 'In Progress', count: inProgress, fill: '#6366f1' },
      { name: 'Pending', count: pending, fill: '#f59e0b' },
    ];

    const priorityData = [
      { name: 'High', count: tasks.filter((t) => t.priority === 'High').length, fill: '#ef4444' },
      { name: 'Medium', count: tasks.filter((t) => t.priority === 'Medium').length, fill: '#f59e0b' },
      { name: 'Low', count: tasks.filter((t) => t.priority === 'Low').length, fill: '#38bdf8' },
    ];

    res.status(200).json({
      success: true,
      statusData,
      priorityData,
      totalTasks: tasks.length,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDashboardStats,
  getRecentProjects,
  getDashboardMyTasks,
  getProductivity,
};
