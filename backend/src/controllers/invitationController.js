const Invitation = require('../models/Invitation');
const Guest = require('../models/Guest');

const sendInvitations = async (req, res, next) => {
  try {
    const { event, guestIds, message } = req.body;
    if (!event || !guestIds || !guestIds.length) {
      return res.status(400).json({ message: 'Event and guest IDs are required' });
    }

    const invitations = await Promise.all(
      guestIds.map(guestId =>
        Invitation.findOneAndUpdate(
          { event, guest: guestId },
          { event, guest: guestId, message, status: 'Sent', sentAt: new Date() },
          { upsert: true, new: true }
        )
      )
    );

    res.status(201).json({ message: `${invitations.length} invitations sent`, invitations });
  } catch (err) { next(err); }
};

const getInvitation = async (req, res, next) => {
  try {
    const invitation = await Invitation.findById(req.params.id)
      .populate('event', 'name date startTime endTime venue dressCode agenda description')
      .populate('guest');

    if (!invitation) return res.status(404).json({ message: 'Invitation not found' });

    if (invitation.status === 'Sent') {
      invitation.status = 'Viewed';
      await invitation.save();
    }
    res.json(invitation);
  } catch (err) { next(err); }
};

const getEventInvitations = async (req, res, next) => {
  try {
    const invitations = await Invitation.find({ event: req.params.eventId })
      .populate('guest', 'guestName email rsvpStatus checkInStatus')
      .sort('-sentAt');
    res.json(invitations);
  } catch (err) { next(err); }
};

const getGuestInvitations = async (req, res, next) => {
  try {
    const email = req.query.email || req.user?.email;
    if (!email) return res.json([]);
    const guests = await Guest.find({ email }).select('_id');
    const guestIds = guests.map(g => g._id);
    const invitations = await Invitation.find({ guest: { $in: guestIds } })
      .populate({ path: 'event', select: 'name date startTime endTime dressCode agenda eventType', populate: { path: 'venue', select: 'name' } })
      .populate('guest', 'guestName email rsvpStatus qrCodeValue checkInStatus checkedInAt dietaryPreferences allergies group')
      .sort('-sentAt');
    res.json(invitations);
  } catch (err) { next(err); }
};

module.exports = { sendInvitations, getInvitation, getEventInvitations, getGuestInvitations };
