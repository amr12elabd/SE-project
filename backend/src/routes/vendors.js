const router = require('express').Router();
const { getVendors, getVendorProfile, getVendorProfileById, createVendorProfile, updateVendorProfile } = require('../controllers/vendorController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getVendors);
router.get('/profile', protect, authorize('vendor'), getVendorProfile);
router.get('/:id', getVendorProfileById);
router.post('/profile', protect, authorize('vendor'), createVendorProfile);
router.put('/profile', protect, authorize('vendor'), updateVendorProfile);

module.exports = router;
