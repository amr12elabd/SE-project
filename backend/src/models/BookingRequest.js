const mongoose = require('mongoose');

const bookingRequestSchema = new mongoose.Schema({
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  venue: { type: mongoose.Schema.Types.ObjectId, ref: 'Venue', required: true },
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', default: null },
  date: { type: Date, required: true },
  expectedAttendees: { type: Number, required: true },
  specialRequirements: { type: String, default: '' },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Declined', 'Counter-Proposed'],
    default: 'Pending'
  },
  ownerMessage: { type: String, default: '' },
  counterProposal: {
    date: { type: Date, default: null },
    price: { type: Number, default: null },
    notes: { type: String, default: '' },
    by: { type: String, enum: ['venueOwner', 'organizer'], default: 'venueOwner' }
  }
}, { timestamps: true });

module.exports = mongoose.model('BookingRequest', bookingRequestSchema);
