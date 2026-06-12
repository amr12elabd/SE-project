const router = require('express').Router({ mergeParams: true });
const { getEventCommunications, sendCommunication, markSeen, sendFollowUpToUnseen } = require('../controllers/communicationController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/', getEventCommunications);
router.post('/', authorize('organizer', 'staff'), sendCommunication);
router.patch('/:id/seen', markSeen);
router.post('/follow-up-unseen', authorize('organizer'), sendFollowUpToUnseen);

module.exports = router;
