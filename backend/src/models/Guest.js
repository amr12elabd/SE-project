const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const guestSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  guestName: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  phone: { type: String, default: '' },
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  group: { type: String, default: 'General' },
  rsvpStatus: {
    type: String,
    enum: ['Pending', 'Attending', 'Not Attending', 'Maybe'],
    default: 'Pending'
  },
  dietaryPreferences: [{ type: String }],
  allergies: [{ type: String }],
  specialRequirements: { type: String, default: '' },
  qrCodeValue: { type: String, default: () => uuidv4() },
  checkInStatus: { type: Boolean, default: false },
  checkedInAt: { type: Date, default: null },
  checkedInBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
}, { timestamps: true });

module.exports = mongoose.model('Guest', guestSchema);
