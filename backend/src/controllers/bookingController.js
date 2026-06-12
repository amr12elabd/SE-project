const BookingRequest = require('../models/BookingRequest');
const Venue = require('../models/Venue');
const Notification = require('../models/Notification');

const getBookings = async (req, res, next) => {
  try {
    const { status } = req.query;
    let filter = {};
    if (req.user.role === 'organizer') filter.organizer = req.user._id;
    if (req.user.role === 'venueOwner') {
      const venues = await Venue.find({ owner: req.user._id }).select('_id');
      filter.venue = { $in: venues.map(v => v._id) };
    }
    if (status) filter.status = status;

    const bookings = await BookingRequest.find(filter)
      .populate('organizer', 'name email phone')
      .populate('venue', 'name location capacity pricing')
      .populate('event', 'name date')
      .sort('-createdAt');
    res.json(bookings);
  } catch (err) { next(err); }
};

const createBooking = async (req, res, next) => {
  try {
    const { venue, event, date, expectedAttendees, specialRequirements } = req.body;
    if (!venue || !date || !expectedAttendees) {
      return res.status(400).json({ message: 'Venue, date, and expected attendees are required' });
    }

    const venueDoc = await Venue.findById(venue);
    if (!venueDoc) return res.status(404).json({ message: 'Venue not found' });

    const booking = await BookingRequest.create({
      organizer: req.user._id, venue, event, date, expectedAttendees, specialRequirements
    });

    await Notification.create({
      user: venueDoc.owner,
      title: 'New Booking Request',
      message: `You have a new booking request from ${req.user.name} for ${new Date(date).toDateString()}`,
      type: 'booking'
    });

    const populated = await BookingRequest.findById(booking._id)
      .populate('organizer', 'name email')
      .populate('venue', 'name location');
    res.status(201).json(populated);
  } catch (err) { next(err); }
};

const getBooking = async (req, res, next) => {
  try {
    const booking = await BookingRequest.findById(req.params.id)
      .populate('organizer', 'name email phone')
      .populate('venue', 'name location capacity pricing')
      .populate('event', 'name date');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json(booking);
  } catch (err) { next(err); }
};

const updateBookingStatus = async (req, res, next) => {
  try {
    const { status, ownerMessage, counterProposal } = req.body;
    const booking = await BookingRequest.findById(req.params.id).populate('venue');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (booking.venue.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    booking.status = status || booking.status;
    if (ownerMessage) booking.ownerMessage = ownerMessage;
    if (counterProposal) booking.counterProposal = counterProposal;
    await booking.save();

    await Notification.create({
      user: booking.organizer,
      title: `Booking ${status}`,
      message: `Your booking request has been ${status.toLowerCase()}`,
      type: 'booking'
    });

    res.json(booking);
  } catch (err) { next(err); }
};

const organizerCounter = async (req, res, next) => {
  try {
    const { date, price, notes } = req.body;
    if (!notes) return res.status(400).json({ message: 'Notes are required for a counter offer' });

    const booking = await BookingRequest.findById(req.params.id).populate('venue');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    booking.status = 'Counter-Proposed';
    booking.counterProposal = { date: date || null, price: price || null, notes, by: 'organizer' };
    await booking.save();

    await Notification.create({
      user: booking.venue.owner,
      title: 'New Counter Offer from Organizer',
      message: `The organizer has sent a counter offer for their booking request`,
      type: 'booking'
    });

    res.json(booking);
  } catch (err) { next(err); }
};

const respondToCounter = async (req, res, next) => {
  try {
    const { accept } = req.body;
    const booking = await BookingRequest.findById(req.params.id).populate('venue');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (booking.status !== 'Counter-Proposed') {
      return res.status(400).json({ message: 'No counter proposal to respond to' });
    }

    booking.status = accept ? 'Approved' : 'Declined';
    await booking.save();

    await Notification.create({
      user: booking.venue.owner,
      title: `Counter Proposal ${accept ? 'Accepted' : 'Declined'}`,
      message: `The organizer has ${accept ? 'accepted' : 'declined'} your counter proposal`,
      type: 'booking'
    });

    res.json(booking);
  } catch (err) { next(err); }
};

module.exports = { getBookings, createBooking, getBooking, updateBookingStatus, respondToCounter, organizerCounter };
