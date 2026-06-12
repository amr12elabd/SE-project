const router = require('express').Router();
const { getNotifications, markRead, markAllRead } = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', getNotifications);
router.patch('/:id/read', markRead);
router.patch('/mark-all-read', markAllRead);

module.exports = router;
