const SourcingRequest = require('../models/SourcingRequest');
const Notification = require('../models/Notification');
const { notifyUser } = require('../socket');

const getSourcingRequests = async (req, res, next) => {
  try {
    const { event, status } = req.query;
    const filter = {};

    if (req.user.role === 'organizer') filter.organizer = req.user._id;
    if (req.user.role === 'vendor') filter.vendor = req.user._id;
    if (event) filter.event = event;
    if (status) filter.status = status;

    const requests = await SourcingRequest.find(filter)
      .populate('organizer', 'name email phone')
      .populate('vendor', 'name email phone')
      .populate('event', 'name date')
      .sort('-createdAt');
    res.json(requests);
  } catch (err) { next(err); }
};

const createSourcingRequest = async (req, res, next) => {
  try {
    const { vendor, event, requestedItems, deliveryDate, eventLocation, totalEstimatedCost } = req.body;
    if (!event || !requestedItems || !deliveryDate) {
      return res.status(400).json({ message: 'Event, items, and delivery date are required' });
    }

    const request = await SourcingRequest.create({
      organizer: req.user._id, vendor, event, requestedItems, deliveryDate, eventLocation, totalEstimatedCost
    });

    if (vendor) {
      await Notification.create({
        user: vendor, title: 'New Sourcing Request', message: 'You have a new sourcing request to review', type: 'general'
      });
    }

    res.status(201).json(request);
  } catch (err) { next(err); }
};

const getSourcingRequest = async (req, res, next) => {
  try {
    const request = await SourcingRequest.findById(req.params.id)
      .populate('organizer', 'name email phone')
      .populate('vendor', 'name email phone')
      .populate('event', 'name date location');
    if (!request) return res.status(404).json({ message: 'Sourcing request not found' });
    res.json(request);
  } catch (err) { next(err); }
};

const updateSourcingStatus = async (req, res, next) => {
  try {
    const { status, clarificationNote, delayNote } = req.body;
    const request = await SourcingRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Sourcing request not found' });

    const prevStatus = request.status;
    request.status = status || request.status;
    if (clarificationNote) request.clarificationNote = clarificationNote;
    if (delayNote) request.delayNote = delayNote;
    await request.save();

    const isDelay = delayNote && delayNote.trim().length > 0;
    const statusChanged = status && status !== prevStatus;

    if (isDelay || statusChanged) {
      const title = isDelay ? '🚨 Delivery Delay Alert' : `Sourcing Request ${status}`;
      const message = isDelay
        ? `Vendor reported a delivery delay: "${delayNote}"`
        : `Your sourcing request status updated to: ${status}`;
      const notif = await Notification.create({ user: request.organizer, title, message, type: isDelay ? 'general' : 'general' });
      try { notifyUser(request.organizer, notif); } catch { /* socket may not be available */ }
    }

    res.json(request);
  } catch (err) { next(err); }
};

const addMessage = async (req, res, next) => {
  try {
    const { message } = req.body;
    const request = await SourcingRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Not found' });
    request.clarificationNote = message;
    await request.save();
    res.json(request);
  } catch (err) { next(err); }
};

module.exports = { getSourcingRequests, createSourcingRequest, getSourcingRequest, updateSourcingStatus, addMessage };
