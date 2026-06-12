const router = require('express').Router({ mergeParams: true });
const { getAttendanceReport, getFinancialReport, getFullReport, exportReport, getVenueReport } = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/attendance', authorize('organizer', 'staff'), getAttendanceReport);
router.get('/financial', authorize('organizer'), getFinancialReport);
router.get('/full', authorize('organizer'), getFullReport);
router.get('/export', authorize('organizer'), exportReport);
router.get('/venue-performance', authorize('venueOwner'), getVenueReport);

module.exports = router;
