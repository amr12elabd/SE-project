const Venue = require('../models/Venue');
const BookingRequest = require('../models/BookingRequest');
const Feedback = require('../models/Feedback');

const getVenues = async (req, res, next) => {
  try {
    const { city, area, minCapacity, maxCapacity, minPrice, maxPrice, isActive } = req.query;
    const filter = { isActive: true };
    if (isActive === 'false') filter.isActive = false;
    if (city) filter['location.city'] = new RegExp(city, 'i');
    if (area) filter['location.area'] = new RegExp(area, 'i');
    if (minCapacity || maxCapacity) {
      filter.capacity = {};
      if (minCapacity) filter.capacity.$gte = Number(minCapacity);
      if (maxCapacity) filter.capacity.$lte = Number(maxCapacity);
    }
    if (minPrice || maxPrice) {
      filter['pricing.perDay'] = {};
      if (minPrice) filter['pricing.perDay'].$gte = Number(minPrice);
      if (maxPrice) filter['pricing.perDay'].$lte = Number(maxPrice);
    }

    const venues = await Venue.find(filter).populate('owner', 'name email phone').sort('-createdAt');
    res.json(venues);
  } catch (err) { next(err); }
};

const createVenue = async (req, res, next) => {
  try {
    const { name, description, location, capacity, dimensions, amenities, pricing, photos, floorPlanUrl } = req.body;
    if (!name || !capacity) return res.status(400).json({ message: 'Name and capacity are required' });

    const venue = await Venue.create({
      owner: req.user._id, name, description, location, capacity,
      dimensions, amenities, pricing, photos, floorPlanUrl
    });
    res.status(201).json(venue);
  } catch (err) { next(err); }
};

const getVenue = async (req, res, next) => {
  try {
    const venue = await Venue.findById(req.params.id).populate('owner', 'name email phone bio');
    if (!venue) return res.status(404).json({ message: 'Venue not found' });
    res.json(venue);
  } catch (err) { next(err); }
};

const updateVenue = async (req, res, next) => {
  try {
    const venue = await Venue.findById(req.params.id);
    if (!venue) return res.status(404).json({ message: 'Venue not found' });
    if (venue.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const updated = await Venue.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json(updated);
  } catch (err) { next(err); }
};

const deleteVenue = async (req, res, next) => {
  try {
    const venue = await Venue.findById(req.params.id);
    if (!venue) return res.status(404).json({ message: 'Venue not found' });
    if (venue.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    venue.isActive = false;
    await venue.save();
    res.json({ message: 'Venue deactivated successfully' });
  } catch (err) { next(err); }
};

const getOwnerVenues = async (req, res, next) => {
  try {
    const venues = await Venue.find({ owner: req.user._id }).sort('-createdAt');
    res.json(venues);
  } catch (err) { next(err); }
};

const getVenueReport = async (req, res, next) => {
  try {
    const venue = await Venue.findById(req.params.id);
    if (!venue) return res.status(404).json({ message: 'Venue not found' });
    if (venue.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const bookings = await BookingRequest.find({ venue: venue._id });
    const bookingStats = {
      total: bookings.length,
      approved: bookings.filter(b => b.status === 'Approved').length,
      pending: bookings.filter(b => b.status === 'Pending').length,
      declined: bookings.filter(b => b.status === 'Declined').length,
      counterProposed: bookings.filter(b => b.status === 'Counter-Proposed').length,
    };

    const approvedEventIds = bookings.filter(b => b.status === 'Approved' && b.event).map(b => b.event);
    const feedback = approvedEventIds.length > 0
      ? await Feedback.find({ event: { $in: approvedEventIds } })
      : [];

    const feedbackStats = feedback.length > 0 ? {
      count: feedback.length,
      avgOverall: feedback.reduce((s, f) => s + f.overallRating, 0) / feedback.length,
      avgVenue: feedback.filter(f => f.venueRating).reduce((s, f) => s + f.venueRating, 0) / (feedback.filter(f => f.venueRating).length || 1),
      avgOrganization: feedback.filter(f => f.organizationRating).reduce((s, f) => s + f.organizationRating, 0) / (feedback.filter(f => f.organizationRating).length || 1),
    } : null;

    const monthlyBookings = bookings.reduce((acc, b) => {
      const month = new Date(b.createdAt).toLocaleString('en', { month: 'short', year: '2-digit' });
      const existing = acc.find(x => x.month === month);
      if (existing) existing.count++;
      else acc.push({ month, count: 1 });
      return acc;
    }, []);

    res.json({ venue: { ...venue.toObject() }, bookings: bookingStats, feedback: feedbackStats, monthlyBookings });
  } catch (err) { next(err); }
};

const markUnavailableDate = async (req, res, next) => {
  try {
    const { date } = req.body;
    if (!date) return res.status(400).json({ message: 'Date is required' });
    const venue = await Venue.findById(req.params.id);
    if (!venue) return res.status(404).json({ message: 'Venue not found' });
    if (venue.owner.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });

    const d = new Date(date);
    const already = venue.unavailableDates.some(ud => new Date(ud).toISOString().slice(0, 10) === d.toISOString().slice(0, 10));
    if (!already) { venue.unavailableDates.push(d); await venue.save(); }
    res.json({ unavailableDates: venue.unavailableDates });
  } catch (err) { next(err); }
};

const removeUnavailableDate = async (req, res, next) => {
  try {
    const { date } = req.body;
    const venue = await Venue.findById(req.params.id);
    if (!venue) return res.status(404).json({ message: 'Venue not found' });
    if (venue.owner.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });

    venue.unavailableDates = venue.unavailableDates.filter(ud => new Date(ud).toISOString().slice(0, 10) !== new Date(date).toISOString().slice(0, 10));
    await venue.save();
    res.json({ unavailableDates: venue.unavailableDates });
  } catch (err) { next(err); }
};

module.exports = { getVenues, createVenue, getVenue, updateVenue, deleteVenue, getOwnerVenues, getVenueReport, markUnavailableDate, removeUnavailableDate };
