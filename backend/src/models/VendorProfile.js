const mongoose = require('mongoose');

const vendorProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  companyName: { type: String, required: true, trim: true },
  suppliesOffered: [{ type: String }],
  mainLocation: { type: String, default: 'Cairo' },
  pricingList: [
    {
      item: { type: String },
      price: { type: Number },
      unit: { type: String, default: 'per unit' }
    }
  ],
  contactInfo: {
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
    website: { type: String, default: '' }
  },
  deliveryRegions: [{ type: String }],
  minimumOrder: { type: Number, default: 0 },
  leadTime: { type: String, default: '2-3 days' },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  logoUrl: { type: String, default: '' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('VendorProfile', vendorProfileSchema);
