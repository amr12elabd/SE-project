const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  startTime: { type: String, default: '10:00' },
  endTime: { type: String, default: '22:00' },
  venue: { type: mongoose.Schema.Types.ObjectId, ref: 'Venue', default: null },
  status: {
    type: String,
    enum: ['Planning', 'Confirmed', 'In Progress', 'Completed', 'Cancelled'],
    default: 'Planning'
  },
  eventType: { type: String, default: 'Pop-Up Café' },
  expectedGuests: { type: Number, default: 0 },
  dressCode: { type: String, default: 'Casual' },
  agenda: { type: String, default: '' },
  totalBudget: { type: Number, default: 0 },
  staffMembers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  coverImageUrl: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
