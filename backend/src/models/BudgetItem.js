const mongoose = require('mongoose');

const budgetItemSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  category: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  plannedAmount: { type: Number, required: true, default: 0 },
  actualAmount: { type: Number, default: 0 },
  notes: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('BudgetItem', budgetItemSchema);
