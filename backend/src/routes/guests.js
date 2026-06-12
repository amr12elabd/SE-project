const router = require('express').Router();
const { getGuests, createGuest, updateGuest, deleteGuest, updateRSVP, checkInGuest, getGuestByQR } = require('../controllers/guestController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/', getGuests);
router.post('/', authorize('organizer'), createGuest);
router.get('/qr/:qrCode', getGuestByQR);
router.put('/:id', authorize('organizer'), updateGuest);
router.delete('/:id', authorize('organizer'), deleteGuest);
router.patch('/:id/rsvp', updateRSVP);
router.patch('/:id/checkin', authorize('organizer', 'staff'), checkInGuest);

module.exports = router;
