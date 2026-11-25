require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');
const Notification = require('../models/Notification');

/**
 * Standalone development seed script.
 * Run manually via: npm run seed
 * Never imported or executed automatically in production.
 */
const seedData = async () => {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Refusing to run dev seed script in production mode');
  }

  await connectDB();

  await Promise.all([
    User.deleteMany({}),
    Project.deleteMany({}),
    Task.deleteMany({}),
    Notification.deleteMany({}),
  ]);

  const [alice, bob, carol] = await User.create([
    {
      name: 'Alice Vance',
      email: 'alice@taskflow.dev',
      password: 'Password123',
    },
    {
      name: 'Bob Mercer',
      email: 'bob@taskflow.dev',
      password: 'Password123',
    },
    {
      name: 'Carol Chen',
      email: 'carol@taskflow.dev',
      password: 'Password123',
    },
  ]);

  const now = new Date();
  const daysFromNow = (d) => new Date(now.getTime() + d * 24 * 60 * 60 * 1000);

  const [webApp, mobileApi, brandRefresh] = await Project.create([
    {
      name: 'Customer Portal v2',
      description: 'Redesign and launch the self-service billing and analytics portal.',
      owner: alice._id,
      members: [bob._id, carol._id],
      startDate: daysFromNow(-14),
      endDate: daysFromNow(20),
      status: 'Active',
    },
    {
      name: 'Mobile Sync Engine',
      description: 'Background offline queue and conflict resolution API for mobile clients.',
      owner: alice._id,
      members: [bob._id],
      startDate: daysFromNow(-7),
      endDate: daysFromNow(30),
      status: 'Active',
    },
    {
      name: 'Q4 Design System Audit',
      description: 'Consolidate dark-mode tokens, spacing scales, and accessible form components.',
      owner: bob._id,
      members: [alice._id],
      startDate: daysFromNow(2),
      endDate: daysFromNow(25),
      status: 'Planning',
    },
  ]);

  const tasks = await Task.create([
    {
      title: 'Implement OAuth & cookie session refresh',
      description: 'Ensure HTTP-only JWT cookies rotate cleanly across client routes.',
      project: webApp._id,
      assignedTo: alice._id,
      createdBy: alice._id,
      priority: 'High',
      status: 'Completed',
      startDate: daysFromNow(-10),
      dueDate: daysFromNow(-2),
    },
    {
      title: 'Build usage metrics chart endpoint',
      description: 'Aggregate daily workspace events and return Recharts-ready series.',
      project: webApp._id,
      assignedTo: bob._id,
      createdBy: alice._id,
      priority: 'High',
      status: 'In Progress',
      startDate: daysFromNow(-3),
      dueDate: daysFromNow(2),
    },
    {
      title: 'Audit invoice PDF export edge cases',
      description: 'Verify multi-currency formatting and tax line items.',
      project: webApp._id,
      assignedTo: carol._id,
      createdBy: alice._id,
      priority: 'Medium',
      status: 'To Do',
      dueDate: daysFromNow(-1),
    },
    {
      title: 'Design delta sync payload schema',
      description: 'Define cursor-based pagination and tombstone records.',
      project: mobileApi._id,
      assignedTo: bob._id,
      createdBy: alice._id,
      priority: 'High',
      status: 'Completed',
      dueDate: daysFromNow(-1),
    },
    {
      title: 'Write conflict resolution unit tests',
      description: 'Cover last-write-wins and field-level merge scenarios.',
      project: mobileApi._id,
      assignedTo: alice._id,
      createdBy: alice._id,
      priority: 'Medium',
      status: 'To Do',
      dueDate: daysFromNow(5),
    },
    {
      title: 'Document dark theme contrast ratios',
      description: 'Ensure all interactive badges meet WCAG AA contrast.',
      project: brandRefresh._id,
      assignedTo: alice._id,
      createdBy: bob._id,
      priority: 'Low',
      status: 'To Do',
      dueDate: daysFromNow(7),
    },
  ]);

  await Notification.create([
    {
      recipient: alice._id,
      message: 'Bob Mercer added you to project "Q4 Design System Audit".',
      type: 'added_to_project',
      relatedProject: brandRefresh._id,
    },
    {
      recipient: bob._id,
      message: `Alice Vance assigned you the task "${tasks[1].title}" in "Customer Portal v2".`,
      type: 'task_assigned',
      relatedProject: webApp._id,
      relatedTask: tasks[1]._id,
    },
  ]);

  console.log('Seeded Jurair Project Management development database successfully.');
  console.log('Demo accounts: alice@taskflow.dev / bob@taskflow.dev / carol@taskflow.dev (Password123)');
  await mongoose.connection.close();
};

seedData().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
