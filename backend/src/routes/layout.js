const router = require('express').Router({ mergeParams: true });
const { getLayout, saveLayout, shareLayout } = require('../controllers/layoutController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/', getLayout);
router.post('/', authorize('organizer'), saveLayout);
router.put('/', authorize('organizer'), saveLayout);
router.patch('/share', authorize('organizer'), shareLayout);

module.exports = router;
