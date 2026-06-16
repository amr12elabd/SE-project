const Feedback = require('../models/Feedback');
const Guest = require('../models/Guest');

const getEventFeedback = async (req, res, next) => {
  try {
    const feedbacks = await Feedback.find({ event: req.params.eventId })
      .populate('guest', 'guestName email')
      .sort('-createdAt');

    const total = feedbacks.length;
    const avgOverall = total ? feedbacks.reduce((s, f) => s + f.overallRating, 0) / total : 0;
    const avgFood = total ? feedbacks.filter(f => f.foodRating).reduce((s, f) => s + (f.foodRating || 0), 0) / Math.max(feedbacks.filter(f => f.foodRating).length, 1) : 0;
    const avgVenue = total ? feedbacks.filter(f => f.venueRating).reduce((s, f) => s + (f.venueRating || 0), 0) / Math.max(feedbacks.filter(f => f.venueRating).length, 1) : 0;
    const avgOrg = total ? feedbacks.filter(f => f.organizationRating).reduce((s, f) => s + (f.organizationRating || 0), 0) / Math.max(feedbacks.filter(f => f.organizationRating).length, 1) : 0;

    const sentimentCount = {
      Positive: feedbacks.filter(f => f.sentiment === 'Positive').length,
      Neutral: feedbacks.filter(f => f.sentiment === 'Neutral').length,
      Negative: feedbacks.filter(f => f.sentiment === 'Negative').length
    };

    res.json({ feedbacks, stats: { total, avgOverall, avgFood, avgVenue, avgOrg, sentimentCount } });
  } catch (err) { next(err); }
};

const submitFeedback = async (req, res, next) => {
  try {
    const { guest, overallRating, foodRating, venueRating, organizationRating, comments } = req.body;
    let guestId = guest;

    if (!guestId && req.user?.email) {
      const guestByEmail = await Guest.findOne({ event: req.params.eventId, email: req.user.email });
      if (guestByEmail) guestId = guestByEmail._id;
    }

    if (!guestId && req.user?._id) {
      const guestByUser = await Guest.findOne({ event: req.params.eventId, user: req.user._id });
      if (guestByUser) guestId = guestByUser._id;
    }

    if (!guestId || !overallRating || Number(overallRating) < 1 || Number(overallRating) > 5) {
      return res.status(400).json({ message: 'Valid guest and overall rating are required' });
    }

    const guestDoc = await Guest.findById(guestId);
    if (!guestDoc) return res.status(404).json({ message: 'Guest not found' });

    const existing = await Feedback.findOne({ event: req.params.eventId, guest: guestId });
    if (existing) {
      await Feedback.deleteOne({ _id: existing._id });
    }

    const feedback = await Feedback.create({
      event: req.params.eventId,
      guest: guestId,
      overallRating,
      foodRating,
      venueRating,
      organizationRating,
      comments,
    });
    res.status(201).json(feedback);
  } catch (err) { next(err); }
};

module.exports = { getEventFeedback, submitFeedback };
