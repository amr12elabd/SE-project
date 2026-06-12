const mongoose = require('mongoose');

const communicationSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  sentBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  recipients: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Guest' }],
  receivedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Guest' }],
  seenBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Guest' }],
  isFollowUp: { type: Boolean, default: false },
  followUpTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Communication', default: null }
}, { timestamps: true });

module.exports = mongoose.model('Communication', communicationSchema);
