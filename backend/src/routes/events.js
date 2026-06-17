const router = require('express').Router();
const { getEvents, createEvent, getEvent, updateEvent, deleteEvent, getEventDashboard, updateEventStatus } = require('../controllers/eventController');
const { protect, authorize } = require('../middleware/auth');
const budgetRoutes = require('./budget');
const layoutRoutes = require('./layout');
const feedbackRoutes = require('./feedback');
const communicationRoutes = require('./communications');
const reportRoutes = require('./reports');
const invitationRoutes = require('./invitations');

router.use(protect);
router.get('/', getEvents);
router.post('/', authorize('organizer'), createEvent);
router.get('/:id', getEvent);
router.put('/:id', authorize('organizer'), updateEvent);
router.patch('/:id/status', authorize('organizer', 'staff'), updateEventStatus);
router.delete('/:id', authorize('organizer'), deleteEvent);
router.get('/:id/dashboard', getEventDashboard);

router.use('/:eventId/budget', (req, res, next) => { req.params.eventId = req.params.eventId; next(); }, budgetRoutes);
router.use('/:eventId/layout', (req, res, next) => { req.params.eventId = req.params.eventId; next(); }, layoutRoutes);
router.use('/:eventId/feedback', (req, res, next) => { req.params.eventId = req.params.eventId; next(); }, feedbackRoutes);
router.use('/:eventId/communications', (req, res, next) => { req.params.eventId = req.params.eventId; next(); }, communicationRoutes);
router.use('/:eventId/reports', (req, res, next) => { req.params.eventId = req.params.eventId; next(); }, reportRoutes);
router.use('/:eventId/invitations', (req, res, next) => { req.params.eventId = req.params.eventId; next(); }, invitationRoutes);

module.exports = router;
