const router = require('express').Router();
const { getMyActivity } = require('../controllers/activityController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', getMyActivity);

module.exports = router;
