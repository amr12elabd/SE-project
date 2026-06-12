const router = require('express').Router();
const { getBookings, createBooking, getBooking, updateBookingStatus, respondToCounter, organizerCounter } = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/', getBookings);
router.post('/', authorize('organizer'), createBooking);
router.get('/:id', getBooking);
router.patch('/:id/status', authorize('venueOwner'), updateBookingStatus);
router.patch('/:id/respond', authorize('organizer'), respondToCounter);
router.patch('/:id/counter', authorize('organizer'), organizerCounter);

module.exports = router;
