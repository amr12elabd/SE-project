const router = require('express').Router();
const { getUsers, getUser, createUser, updateUser, changePassword, deactivateUser, activateUser } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/', authorize('organizer', 'staff'), getUsers);
router.post('/', authorize('organizer'), createUser);
router.get('/:id', getUser);
router.put('/:id', updateUser);
router.patch('/me/password', changePassword);
router.patch('/:id/deactivate', authorize('organizer'), deactivateUser);
router.patch('/:id/activate', authorize('organizer'), activateUser);

module.exports = router;
