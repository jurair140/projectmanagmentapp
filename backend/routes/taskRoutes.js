const express = require('express');
const {
  createTask,
  getTasks,
  getMyTasks,
  getTaskById,
  updateTask,
  deleteTask,
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');
const validateRequest = require('../validators/validateRequest');
const { createTaskValidator, updateTaskValidator } = require('../validators/taskValidator');

const router = express.Router();

router.use(protect);

router.get('/my-tasks', getMyTasks);
router.route('/').post(createTaskValidator, validateRequest, createTask).get(getTasks);
router
  .route('/:id')
  .get(getTaskById)
  .put(updateTaskValidator, validateRequest, updateTask)
  .delete(deleteTask);

module.exports = router;
