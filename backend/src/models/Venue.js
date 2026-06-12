const mongoose = require('mongoose');

const venueSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  location: {
    address: { type: String, default: '' },
    city: { type: String, default: 'Cairo' },
    area: { type: String, default: '' }
  },
  capacity: { type: Number, required: true },
  dimensions: { type: String, default: '' },
  amenities: [{ type: String }],
  pricing: {
    perDay: { type: Number, default: 0 },
    perHour: { type: Number, default: 0 },
    currency: { type: String, default: 'EGP' }
  },
  photos: [{ type: String }],
  floorPlanUrl: { type: String, default: '' },
  availabilityDates: [{ type: Date }],
  unavailableDates: [{ type: Date }],
  isActive: { type: Boolean, default: true },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Venue', venueSchema);
