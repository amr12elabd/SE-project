const mongoose = require('mongoose');

const invitationSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  guest: { type: mongoose.Schema.Types.ObjectId, ref: 'Guest', required: true },
  status: {
    type: String,
    enum: ['Sent', 'Viewed', 'Responded'],
    default: 'Sent'
  },
  message: { type: String, default: '' },
  sentAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Invitation', invitationSchema);
