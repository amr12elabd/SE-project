const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  sourcingRequest: { type: mongoose.Schema.Types.ObjectId, ref: 'SourcingRequest', default: null },
  invoiceNumber: { type: String, unique: true },
  items: [
    {
      description: { type: String, required: true },
      quantity: { type: Number, required: true },
      unitPrice: { type: Number, required: true },
      total: { type: Number, required: true }
    }
  ],
  totalAmount: { type: Number, required: true },
  status: {
    type: String,
    enum: ['Pending Review', 'Approved', 'Rejected', 'Paid'],
    default: 'Pending Review'
  },
  itemizedBreakdown: { type: String, default: '' },
  notes: { type: String, default: '' },
  dueDate: { type: Date, default: null }
}, { timestamps: true });

invoiceSchema.pre('save', function (next) {
  if (!this.invoiceNumber) {
    this.invoiceNumber = 'INV-' + Date.now();
  }
  next();
});

module.exports = mongoose.model('Invoice', invoiceSchema);
