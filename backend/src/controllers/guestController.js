const Guest = require('../models/Guest');
const Invitation = require('../models/Invitation');
const Notification = require('../models/Notification');

const getGuests = async (req, res, next) => {
  try {
    const { event, rsvpStatus, group, checkedIn, search } = req.query;
    const filter = {};

    if (event) filter.event = event;
    if (rsvpStatus) filter.rsvpStatus = rsvpStatus;
    if (group) filter.group = group;
    if (checkedIn !== undefined) filter.checkInStatus = checkedIn === 'true';
    if (search) filter.$or = [
      { guestName: new RegExp(search, 'i') },
      { email: new RegExp(search, 'i') }
    ];

    const guests = await Guest.find(filter)
      .populate('event', 'name date')
      .populate('checkedInBy', 'name')
      .sort('guestName');
    res.json(guests);
  } catch (err) { next(err); }
};

const createGuest = async (req, res, next) => {
  try {
    const { guestName, email, phone, event, group, dietaryPreferences, allergies, specialRequirements } = req.body;
    if (!guestName || !email || !event) {
      return res.status(400).json({ message: 'Name, email, and event are required' });
    }
    const guest = await Guest.create({ guestName, email, phone, event, group, dietaryPreferences, allergies, specialRequirements });
    res.status(201).json(guest);
  } catch (err) { next(err); }
};

const updateGuest = async (req, res, next) => {
  try {
    const guest = await Guest.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!guest) return res.status(404).json({ message: 'Guest not found' });
    res.json(guest);
  } catch (err) { next(err); }
};

const deleteGuest = async (req, res, next) => {
  try {
    const guest = await Guest.findById(req.params.id);
    if (!guest) return res.status(404).json({ message: 'Guest not found' });
    await guest.deleteOne();
    res.json({ message: 'Guest removed' });
  } catch (err) { next(err); }
};

const updateRSVP = async (req, res, next) => {
  try {
    const { rsvpStatus, dietaryPreferences, allergies, specialRequirements } = req.body;
    const guest = await Guest.findById(req.params.id);
    if (!guest) return res.status(404).json({ message: 'Guest not found' });

    if (rsvpStatus) guest.rsvpStatus = rsvpStatus;
    if (dietaryPreferences) guest.dietaryPreferences = dietaryPreferences;
    if (allergies) guest.allergies = allergies;
    if (specialRequirements !== undefined) guest.specialRequirements = specialRequirements;

    await guest.save();

    const invitation = await Invitation.findOne({ guest: guest._id });
    if (invitation) { invitation.status = 'Responded'; await invitation.save(); }

    res.json(guest);
  } catch (err) { next(err); }
};

const checkInGuest = async (req, res, next) => {
  try {
    const { qrCodeValue } = req.body;
    let guest;

    if (qrCodeValue) {
      guest = await Guest.findOne({ qrCodeValue });
    } else {
      guest = await Guest.findById(req.params.id);
    }

    if (!guest) return res.status(404).json({ message: 'Guest not found' });

    if (guest.checkInStatus) {
      guest.checkInStatus = false;
      guest.checkedInAt = null;
      guest.checkedInBy = null;
    } else {
      guest.checkInStatus = true;
      guest.checkedInAt = new Date();
      guest.checkedInBy = req.user._id;
      guest.rsvpStatus = 'Attending';
    }
    await guest.save();

    res.json({ message: guest.checkInStatus ? 'Guest checked in' : 'Check-in undone', guest });
  } catch (err) { next(err); }
};

const getGuestByQR = async (req, res, next) => {
  try {
    const guest = await Guest.findOne({ qrCodeValue: req.params.qrCode }).populate('event', 'name date');
    if (!guest) return res.status(404).json({ message: 'Guest not found' });
    res.json(guest);
  } catch (err) { next(err); }
};

module.exports = { getGuests, createGuest, updateGuest, deleteGuest, updateRSVP, checkInGuest, getGuestByQR };
