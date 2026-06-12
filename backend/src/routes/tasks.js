const router = require('express').Router();
const { getTasks, createTask, updateTask, updateTaskStatus, deleteTask } = require('../controllers/taskController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/', getTasks);
router.post('/', authorize('organizer'), createTask);
router.put('/:id', authorize('organizer'), updateTask);
router.patch('/:id/status', updateTaskStatus);
router.delete('/:id', authorize('organizer'), deleteTask);

module.exports = router;
