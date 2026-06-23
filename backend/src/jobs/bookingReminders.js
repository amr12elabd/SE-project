const BookingRequest = require('../models/BookingRequest');
const Notification = require('../models/Notification');
const User = require('../models/User');

const sendUpcomingBookingReminders = async () => {
  try {
    const now = new Date();
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const in48h = new Date(now.getTime() + 48 * 60 * 60 * 1000);
    const in7d  = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const in7d1 = new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000);

    // Find approved bookings coming up in 24h or 7 days
    const upcoming = await BookingRequest.find({
      status: 'Approved',
      date: { $gte: now, $lte: in7d1 }
    }).populate('venue', 'name owner').populate('organizer', 'name');

    for (const booking of upcoming) {
      const daysUntil = Math.ceil((new Date(booking.date) - now) / (1000 * 60 * 60 * 24));
      const reminderKey = `reminder_${booking._id}_${daysUntil}`;

      // Check if we already sent this reminder (avoid duplicates)
      const exists = await Notification.findOne({ user: booking.venue?.owner, title: { $regex: reminderKey } });
      if (exists) continue;

      if (daysUntil === 1 || daysUntil === 7) {
        await Notification.create({
          user: booking.venue?.owner,
          title: `[${reminderKey}] Booking Tomorrow — ${booking.venue?.name}`,
          message: `Reminder: ${booking.organizer?.name} has a confirmed booking at ${booking.venue?.name} ${daysUntil === 1 ? 'TOMORROW' : 'in 7 days'} (${new Date(booking.date).toDateString()}). Please ensure the venue is ready.`,
          type: 'booking'
        });
      }
    }
    console.log(`[Reminders] Processed ${upcoming.length} upcoming bookings`);
  } catch (err) {
    console.error('[Reminders] Error:', err.message);
  }
};

module.exports = { sendUpcomingBookingReminders };
