const mongoose = require('mongoose');

const vendorRatingSchema = new mongoose.Schema({
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  review: { type: String, default: '' },
  categories: {
    quality: { type: Number, min: 1, max: 5, default: null },
    punctuality: { type: Number, min: 1, max: 5, default: null },
    communication: { type: Number, min: 1, max: 5, default: null },
    value: { type: Number, min: 1, max: 5, default: null },
  }
}, { timestamps: true });

vendorRatingSchema.index({ vendor: 1, organizer: 1, event: 1 }, { unique: true });

module.exports = mongoose.model('VendorRating', vendorRatingSchema);
