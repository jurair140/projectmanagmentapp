const express = require('express');
const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addProjectMember,
  removeProjectMember,
} = require('../controllers/projectController');
const { getProjectTasks } = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');
const { requireProjectAccess, requireProjectOwner } = require('../middleware/projectPermission');
const validateRequest = require('../validators/validateRequest');
const {
  createProjectValidator,
  updateProjectValidator,
  addMemberValidator,
} = require('../validators/projectValidator');

const router = express.Router();

router.use(protect);

router.route('/').post(createProjectValidator, validateRequest, createProject).get(getProjects);

router
  .route('/:id')
  .get(requireProjectAccess, getProjectById)
  .put(requireProjectOwner, updateProjectValidator, validateRequest, updateProject)
  .delete(requireProjectOwner, deleteProject);

router.post(
  '/:id/members',
  requireProjectOwner,
  addMemberValidator,
  validateRequest,
  addProjectMember
);

router.delete('/:id/members/:userId', requireProjectOwner, removeProjectMember);

router.get('/:id/tasks', requireProjectAccess, getProjectTasks);

module.exports = router;
