const { body } = require('express-validator');
const { TASK_PRIORITIES, TASK_STATUSES } = require('../models/Task');

const createTaskValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Task title is required')
    .isLength({ min: 2, max: 200 })
    .withMessage('Task title must be between 2 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 3000 })
    .withMessage('Description cannot exceed 3000 characters'),
  body('project')
    .notEmpty()
    .withMessage('Project is required')
    .isMongoId()
    .withMessage('Valid project ID is required'),
  body('assignedTo')
    .optional({ nullable: true, checkFalsy: true })
    .isMongoId()
    .withMessage('Valid assigned member ID is required'),
  body('priority')
    .optional()
    .isIn(TASK_PRIORITIES)
    .withMessage(`Priority must be one of: ${TASK_PRIORITIES.join(', ')}`),
  body('status')
    .optional()
    .isIn(TASK_STATUSES)
    .withMessage(`Status must be one of: ${TASK_STATUSES.join(', ')}`),
  body('startDate')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601()
    .withMessage('Valid start date is required'),
  body('dueDate')
    .notEmpty()
    .withMessage('Due date is required')
    .isISO8601()
    .withMessage('Valid due date is required')
    .custom((value, { req }) => {
      if (req.body.startDate && new Date(value) < new Date(req.body.startDate)) {
        throw new Error('Due date cannot be earlier than start date');
      }
      return true;
    }),
];

const updateTaskValidator = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Task title must be between 2 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 3000 })
    .withMessage('Description cannot exceed 3000 characters'),
  body('assignedTo')
    .optional({ nullable: true, checkFalsy: true })
    .isMongoId()
    .withMessage('Valid assigned member ID is required'),
  body('priority')
    .optional()
    .isIn(TASK_PRIORITIES)
    .withMessage(`Priority must be one of: ${TASK_PRIORITIES.join(', ')}`),
  body('status')
    .optional()
    .isIn(TASK_STATUSES)
    .withMessage(`Status must be one of: ${TASK_STATUSES.join(', ')}`),
  body('startDate')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601()
    .withMessage('Valid start date is required'),
  body('dueDate').optional().isISO8601().withMessage('Valid due date is required'),
];

module.exports = {
  createTaskValidator,
  updateTaskValidator,
};
