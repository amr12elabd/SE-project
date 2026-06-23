const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, required: true },
  action: { type: String, required: true },
  entityType: { type: String, enum: ['Booking', 'Invoice', 'SourcingRequest', 'Task', 'Guest', 'Event'], required: true },
  entityId: { type: mongoose.Schema.Types.ObjectId },
  description: { type: String, required: true },
  oldStatus: { type: String, default: null },
  newStatus: { type: String, default: null },
  metadata: { type: Object, default: {} },
}, { timestamps: true });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
