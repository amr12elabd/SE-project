const router = require('express').Router();
const { generateEventContent } = require('../controllers/aiController');
const { protect, authorize } = require('../middleware/auth');

router.post('/generate', protect, authorize('organizer'), generateEventContent);

module.exports = router;
