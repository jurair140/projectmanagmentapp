const Notification = require('../models/Notification');
const Task = require('../models/Task');
const { getTaskDeadlineFlags } = require('./calculateProgress');

/**
 * Create a notification record safely without interrupting the primary request flow.
 */
const createNotification = async ({
  recipient,
  message,
  type,
  relatedProject = null,
  relatedTask = null,
}) => {
  if (!recipient || !message || !type) return null;
  try {
    return await Notification.create({
      recipient,
      message,
      type,
      relatedProject,
      relatedTask,
    });
  } catch (err) {
    if (process.env.NODE_ENV !== 'test') {
      console.error('Failed to create notification:', err.message);
    }
    return null;
  }
};

/**
 * Ensure deadline_approaching notifications exist for a user's tasks due within 3 days.
 * Deduplicates so a user isn't notified repeatedly for the same task.
 */
const syncUpcomingDeadlineNotifications = async (userId) => {
  if (!userId) return;
  try {
    const tasks = await Task.find({
      assignedTo: userId,
      status: { $ne: 'Completed' },
    })
      .populate('project', 'name')
      .lean();

    const dueSoonTasks = tasks.filter((task) => getTaskDeadlineFlags(task).isDueSoon);
    if (dueSoonTasks.length === 0) return;

    const existing = await Notification.find({
      recipient: userId,
      type: 'deadline_approaching',
      relatedTask: { $in: dueSoonTasks.map((t) => t._id) },
    })
      .select('relatedTask')
      .lean();

    const notifiedTaskIds = new Set(existing.map((n) => String(n.relatedTask)));

    const toCreate = dueSoonTasks
      .filter((task) => !notifiedTaskIds.has(String(task._id)))
      .map((task) => ({
        recipient: userId,
        message: `Task "${task.title}" in ${task.project?.name || 'your project'} is due soon.`,
        type: 'deadline_approaching',
        relatedProject: task.project?._id || task.project || null,
        relatedTask: task._id,
      }));

    if (toCreate.length > 0) {
      await Notification.insertMany(toCreate);
    }
  } catch (err) {
    if (process.env.NODE_ENV !== 'test') {
      console.error('Failed to sync deadline notifications:', err.message);
    }
  }
};

module.exports = {
  createNotification,
  syncUpcomingDeadlineNotifications,
};
