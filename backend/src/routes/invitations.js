const router = require('express').Router({ mergeParams: true });
const { sendInvitations, getInvitation, getEventInvitations, getGuestInvitations } = require('../controllers/invitationController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/', getEventInvitations);
router.post('/send', authorize('organizer'), sendInvitations);
router.get('/guest', getGuestInvitations);
router.get('/:id', getInvitation);

module.exports = router;
