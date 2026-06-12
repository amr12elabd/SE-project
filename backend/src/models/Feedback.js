const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  guest: { type: mongoose.Schema.Types.ObjectId, ref: 'Guest', required: true },
  overallRating: { type: Number, min: 1, max: 5, required: true },
  foodRating: { type: Number, min: 1, max: 5, default: null },
  venueRating: { type: Number, min: 1, max: 5, default: null },
  organizationRating: { type: Number, min: 1, max: 5, default: null },
  comments: { type: String, default: '' },
  sentiment: {
    type: String,
    enum: ['Positive', 'Neutral', 'Negative'],
    default: 'Neutral'
  }
}, { timestamps: true });

feedbackSchema.pre('save', function (next) {
  if (this.overallRating >= 4) this.sentiment = 'Positive';
  else if (this.overallRating <= 2) this.sentiment = 'Negative';
  else this.sentiment = 'Neutral';
  next();
});

module.exports = mongoose.model('Feedback', feedbackSchema);
