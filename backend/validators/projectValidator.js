const { body } = require('express-validator');
const { PROJECT_STATUSES } = require('../models/Project');

const createProjectValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Project name is required')
    .isLength({ min: 2, max: 120 })
    .withMessage('Project name must be between 2 and 120 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),
  body('startDate')
    .notEmpty()
    .withMessage('Start date is required')
    .isISO8601()
    .withMessage('Valid start date is required'),
  body('endDate')
    .notEmpty()
    .withMessage('End date is required')
    .isISO8601()
    .withMessage('Valid end date is required')
    .custom((value, { req }) => {
      if (req.body.startDate && new Date(value) < new Date(req.body.startDate)) {
        throw new Error('End date cannot be earlier than start date');
      }
      return true;
    }),
  body('status')
    .optional()
    .isIn(PROJECT_STATUSES)
    .withMessage(`Status must be one of: ${PROJECT_STATUSES.join(', ')}`),
];

const updateProjectValidator = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 120 })
    .withMessage('Project name must be between 2 and 120 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),
  body('startDate').optional().isISO8601().withMessage('Valid start date is required'),
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('Valid end date is required')
    .custom((value, { req }) => {
      if (req.body.startDate && new Date(value) < new Date(req.body.startDate)) {
        throw new Error('End date cannot be earlier than start date');
      }
      return true;
    }),
  body('status')
    .optional()
    .isIn(PROJECT_STATUSES)
    .withMessage(`Status must be one of: ${PROJECT_STATUSES.join(', ')}`),
];

const addMemberValidator = [
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('userId').optional().isMongoId().withMessage('Valid user ID is required'),
  body().custom((value) => {
    if (!value.email && !value.userId) {
      throw new Error('Member email or user ID is required');
    }
    return true;
  }),
];

module.exports = {
  createProjectValidator,
  updateProjectValidator,
  addMemberValidator,
};
