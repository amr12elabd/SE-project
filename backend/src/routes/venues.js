const router = require('express').Router();
const { getVenues, createVenue, getVenue, updateVenue, deleteVenue, getOwnerVenues, getVenueReport, markUnavailableDate, removeUnavailableDate } = require('../controllers/venueController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getVenues);
router.get('/my-venues', protect, authorize('venueOwner'), getOwnerVenues);
router.get('/:id/report', protect, authorize('venueOwner'), getVenueReport);
router.get('/:id', getVenue);
router.post('/', protect, authorize('venueOwner'), createVenue);
router.put('/:id', protect, authorize('venueOwner'), updateVenue);
router.delete('/:id', protect, authorize('venueOwner'), deleteVenue);
router.post('/:id/unavailable', protect, authorize('venueOwner'), markUnavailableDate);
router.delete('/:id/unavailable', protect, authorize('venueOwner'), removeUnavailableDate);

module.exports = router;
