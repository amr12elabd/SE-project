const Event = require('../models/Event');
const Guest = require('../models/Guest');
const BudgetItem = require('../models/BudgetItem');
const Feedback = require('../models/Feedback');
const Task = require('../models/Task');
const SourcingRequest = require('../models/SourcingRequest');

const getAttendanceReport = async (req, res, next) => {
  try {
    const eventId = req.params.eventId;
    const event = await Event.findById(eventId).populate('venue', 'name');
    const guests = await Guest.find({ event: eventId });

    const report = {
      event: event?.name,
      date: event?.date,
      venue: event?.venue?.name || 'TBD',
      expectedGuests: event?.expectedGuests || 0,
      totalInvited: guests.length,
      attending: guests.filter(g => g.rsvpStatus === 'Attending').length,
      notAttending: guests.filter(g => g.rsvpStatus === 'Not Attending').length,
      maybe: guests.filter(g => g.rsvpStatus === 'Maybe').length,
      pending: guests.filter(g => g.rsvpStatus === 'Pending').length,
      checkedIn: guests.filter(g => g.checkInStatus).length,
      attendanceRate: guests.length > 0 ? ((guests.filter(g => g.checkInStatus).length / guests.length) * 100).toFixed(1) : 0,
      dietaryBreakdown: guests.reduce((acc, g) => {
        g.dietaryPreferences.forEach(d => { acc[d] = (acc[d] || 0) + 1; });
        return acc;
      }, {})
    };
    res.json(report);
  } catch (err) { next(err); }
};

const getFinancialReport = async (req, res, next) => {
  try {
    const eventId = req.params.eventId;
    const event = await Event.findById(eventId);
    const budgetItems = await BudgetItem.find({ event: eventId });
    const sourcingRequests = await SourcingRequest.find({ event: eventId, status: 'Delivered' });

    const totalPlanned = budgetItems.reduce((s, i) => s + i.plannedAmount, 0);
    const totalActual = budgetItems.reduce((s, i) => s + i.actualAmount, 0);

    const categoryBreakdown = budgetItems.reduce((acc, item) => {
      if (!acc[item.category]) acc[item.category] = { planned: 0, actual: 0 };
      acc[item.category].planned += item.plannedAmount;
      acc[item.category].actual += item.actualAmount;
      return acc;
    }, {});

    res.json({
      event: event?.name,
      totalBudget: event?.totalBudget || 0,
      totalPlanned,
      totalActual,
      variance: totalPlanned - totalActual,
      overBudget: totalActual > (event?.totalBudget || 0),
      categoryBreakdown,
      budgetItems
    });
  } catch (err) { next(err); }
};

const getFullReport = async (req, res, next) => {
  try {
    const eventId = req.params.eventId;
    const [event, guests, budgetItems, feedbacks, tasks] = await Promise.all([
      Event.findById(eventId).populate('venue', 'name location').populate('organizer', 'name email'),
      Guest.find({ event: eventId }),
      BudgetItem.find({ event: eventId }),
      Feedback.find({ event: eventId }),
      Task.find({ event: eventId }).populate('assignedTo', 'name')
    ]);

    const totalActual = budgetItems.reduce((s, i) => s + i.actualAmount, 0);
    const avgFeedback = feedbacks.length
      ? feedbacks.reduce((s, f) => s + f.overallRating, 0) / feedbacks.length
      : 0;

    res.json({
      event,
      attendance: {
        total: guests.length,
        attending: guests.filter(g => g.rsvpStatus === 'Attending').length,
        checkedIn: guests.filter(g => g.checkInStatus).length
      },
      financial: {
        totalBudget: event?.totalBudget || 0,
        totalPlanned: budgetItems.reduce((s, i) => s + i.plannedAmount, 0),
        totalActual,
        items: budgetItems
      },
      tasks: {
        total: tasks.length,
        done: tasks.filter(t => t.status === 'Done').length,
        inProgress: tasks.filter(t => t.status === 'In Progress').length
      },
      feedback: {
        total: feedbacks.length,
        avgRating: avgFeedback.toFixed(1),
        positive: feedbacks.filter(f => f.sentiment === 'Positive').length,
        negative: feedbacks.filter(f => f.sentiment === 'Negative').length
      }
    });
  } catch (err) { next(err); }
};

const exportReport = async (req, res, next) => {
  try {
    const eventId = req.params.eventId;
    const event = await Event.findById(eventId);
    const guests = await Guest.find({ event: eventId });
    const budgetItems = await BudgetItem.find({ event: eventId });
    const feedbacks = await Feedback.find({ event: eventId }).populate('guest', 'guestName');

    const csvLines = [
      `PopEyez Event Report - ${event?.name}`,
      `Date: ${event?.date?.toDateString()}`,
      ``,
      `=== ATTENDANCE ===`,
      `Total Guests,${guests.length}`,
      `Checked In,${guests.filter(g => g.checkInStatus).length}`,
      ``,
      `=== BUDGET ===`,
      `Total Budget,${event?.totalBudget || 0} EGP`,
      `Total Actual,${budgetItems.reduce((s, i) => s + i.actualAmount, 0)} EGP`,
      ``,
      `=== FEEDBACK ===`,
      `Total Responses,${feedbacks.length}`,
      `Avg Rating,${feedbacks.length ? (feedbacks.reduce((s, f) => s + f.overallRating, 0) / feedbacks.length).toFixed(1) : 'N/A'}`
    ];

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=event-report-${eventId}.csv`);
    res.send(csvLines.join('\n'));
  } catch (err) { next(err); }
};

const getVenueReport = async (req, res, next) => {
  try {
    const Venue = require('../models/Venue');
    const BookingRequest = require('../models/BookingRequest');

    const venues = await Venue.find({ owner: req.user._id });
    const venueIds = venues.map(v => v._id);

    const bookings = await BookingRequest.find({
      venue: { $in: venueIds },
      status: 'Approved'
    }).populate('venue', 'name pricing');

    const totalRevenue = bookings.reduce((s, b) => {
      const venue = venues.find(v => v._id.toString() === b.venue._id.toString());
      return s + (venue?.pricing?.perDay || 0);
    }, 0);

    const venueStats = venues.map(v => ({
      name: v.name,
      location: v.location,
      totalBookings: bookings.filter(b => b.venue._id.toString() === v._id.toString()).length,
      revenue: bookings.filter(b => b.venue._id.toString() === v._id.toString()).length * (v.pricing?.perDay || 0)
    }));

    res.json({ venues: venueStats, totalBookings: bookings.length, totalRevenue });
  } catch (err) { next(err); }
};

module.exports = { getAttendanceReport, getFinancialReport, getFullReport, exportReport, getVenueReport };
