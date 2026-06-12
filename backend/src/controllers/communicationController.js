const Communication = require('../models/Communication');
const Guest = require('../models/Guest');

const getEventCommunications = async (req, res, next) => {
  try {
    const comms = await Communication.find({ event: req.params.eventId })
      .populate('sentBy', 'name email')
      .populate('recipients', 'guestName email')
      .populate('seenBy', 'guestName email')
      .sort('-createdAt');
    res.json(comms);
  } catch (err) { next(err); }
};

const sendCommunication = async (req, res, next) => {
  try {
    const { message, recipientIds } = req.body;
    if (!message) return res.status(400).json({ message: 'Message is required' });

    let recipients = recipientIds;
    if (!recipients || !recipients.length) {
      const guests = await Guest.find({ event: req.params.eventId }).select('_id');
      recipients = guests.map(g => g._id);
    }

    const comm = await Communication.create({
      event: req.params.eventId,
      sentBy: req.user._id,
      message,
      recipients,
      receivedBy: recipients
    });

    res.status(201).json(comm);
  } catch (err) { next(err); }
};

const markSeen = async (req, res, next) => {
  try {
    const { guestId } = req.body;
    const comm = await Communication.findById(req.params.id);
    if (!comm) return res.status(404).json({ message: 'Communication not found' });

    if (guestId && !comm.seenBy.includes(guestId)) {
      comm.seenBy.push(guestId);
      await comm.save();
    }
    res.json({ message: 'Marked as seen' });
  } catch (err) { next(err); }
};

const sendFollowUpToUnseen = async (req, res, next) => {
  try {
    const { followUpMessage, originalCommId } = req.body;
    const original = await Communication.findById(originalCommId);
    if (!original) return res.status(404).json({ message: 'Original communication not found' });

    const unseenGuests = original.recipients.filter(
      r => !original.seenBy.map(s => s.toString()).includes(r.toString())
    );

    if (!unseenGuests.length) return res.json({ message: 'All guests have seen the message' });

    const followUp = await Communication.create({
      event: req.params.eventId,
      sentBy: req.user._id,
      message: followUpMessage || original.message,
      recipients: unseenGuests,
      receivedBy: unseenGuests,
      isFollowUp: true,
      followUpTo: originalCommId
    });

    res.status(201).json({ message: `Follow-up sent to ${unseenGuests.length} guests`, followUp });
  } catch (err) { next(err); }
};

module.exports = { getEventCommunications, sendCommunication, markSeen, sendFollowUpToUnseen };
