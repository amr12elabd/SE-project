const router = require('express').Router();
const { getSourcingRequests, createSourcingRequest, getSourcingRequest, updateSourcingStatus, addMessage } = require('../controllers/sourcingController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/', getSourcingRequests);
router.post('/', authorize('organizer'), createSourcingRequest);
router.get('/:id', getSourcingRequest);
router.patch('/:id/status', updateSourcingStatus);
router.post('/:id/message', addMessage);

module.exports = router;
