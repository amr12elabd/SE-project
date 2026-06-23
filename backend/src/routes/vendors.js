const router = require('express').Router();
const { getVendors, getVendorProfile, getVendorProfileById, createVendorProfile, updateVendorProfile, submitRating, getVendorRatings } = require('../controllers/vendorController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getVendors);
router.get('/profile', protect, authorize('vendor'), getVendorProfile);
router.post('/profile', protect, authorize('vendor'), createVendorProfile);
router.put('/profile', protect, authorize('vendor'), updateVendorProfile);
router.post('/ratings', protect, authorize('organizer'), submitRating);
router.get('/:id/ratings', getVendorRatings);
router.get('/:id', getVendorProfileById);

module.exports = router;
