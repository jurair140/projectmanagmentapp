/**
 * Return UTC start-of-day date for consistent date comparisons.
 */
const getStartOfToday = () => {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
};

/**
 * Determine whether a task is overdue or due within the next 3 days.
 */
const getTaskDeadlineFlags = (task) => {
  if (!task || !task.dueDate || task.status === 'Completed') {
    return { isOverdue: false, isDueSoon: false };
  }

  const todayStart = getStartOfToday();
  const due = new Date(task.dueDate);
  const dueDayStart = new Date(Date.UTC(due.getUTCFullYear(), due.getUTCMonth(), due.getUTCDate()));

  const threeDaysFromNow = new Date(todayStart);
  threeDaysFromNow.setUTCDate(threeDaysFromNow.getUTCDate() + 3);

  const isOverdue = dueDayStart < todayStart;
  const isDueSoon = !isOverdue && dueDayStart <= threeDaysFromNow;

  return { isOverdue, isDueSoon };
};

/**
 * Calculate project progress and task statistics from a list of tasks.
 */
const calculateProjectStats = (tasks = [], projectStatus = 'Planning') => {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'Completed').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'In Progress').length;
  const todoTasks = tasks.filter((t) => t.status === 'To Do').length;
  const pendingTasks = totalTasks - completedTasks;
  const overdueTasks = tasks.filter((t) => getTaskDeadlineFlags(t).isOverdue).length;

  const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
  const suggestCompleted =
    totalTasks > 0 && completedTasks === totalTasks && projectStatus !== 'Completed';

  return {
    totalTasks,
    completedTasks,
    inProgressTasks,
    todoTasks,
    pendingTasks,
    overdueTasks,
    progress,
    suggestCompleted,
  };
};

module.exports = {
  getStartOfToday,
  getTaskDeadlineFlags,
  calculateProjectStats,
};
