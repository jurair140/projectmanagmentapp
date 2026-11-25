const mongoose = require('mongoose');

const PROJECT_STATUSES = ['Planning', 'Active', 'Completed', 'On Hold'];

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      minlength: [2, 'Project name must be at least 2 characters'],
      maxlength: [120, 'Project name cannot exceed 120 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    status: {
      type: String,
      enum: {
        values: PROJECT_STATUSES,
        message: 'Status must be Planning, Active, Completed, or On Hold',
      },
      default: 'Planning',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

projectSchema.index({ owner: 1, updatedAt: -1 });
projectSchema.index({ members: 1, updatedAt: -1 });

module.exports = mongoose.model('Project', projectSchema);
module.exports.PROJECT_STATUSES = PROJECT_STATUSES;
