const router = require('express').Router({ mergeParams: true });
const { getEventFeedback, submitFeedback } = require('../controllers/feedbackController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', getEventFeedback);
router.post('/', submitFeedback);

module.exports = router;
