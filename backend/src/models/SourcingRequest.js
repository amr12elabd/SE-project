const mongoose = require('mongoose');

const sourcingRequestSchema = new mongoose.Schema({
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  requestedItems: [
    {
      item: { type: String, required: true },
      quantity: { type: Number, required: true },
      unit: { type: String, default: 'units' },
      notes: { type: String, default: '' }
    }
  ],
  deliveryDate: { type: Date, required: true },
  eventLocation: { type: String, default: '' },
  status: {
    type: String,
    enum: ['Pending', 'Accepted', 'Declined', 'Preparing', 'Out for Delivery', 'Delivered'],
    default: 'Pending'
  },
  clarificationNote: { type: String, default: '' },
  delayNote: { type: String, default: '' },
  totalEstimatedCost: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('SourcingRequest', sourcingRequestSchema);
