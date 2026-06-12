const mongoose = require('mongoose');

const layoutSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true, unique: true },
  elements: [
    {
      id: { type: String, required: true },
      type: { type: String, enum: ['table', 'booth', 'chair', 'bar', 'stage', 'entrance', 'exit', 'equipment', 'decoration', 'wall'], default: 'table' },
      label: { type: String, default: '' },
      x: { type: Number, default: 0 },
      y: { type: Number, default: 0 },
      width: { type: Number, default: 80 },
      height: { type: Number, default: 80 },
      rotation: { type: Number, default: 0 },
      color: { type: String, default: '#4CAF50' },
      seats: { type: Number, default: 0 }
    }
  ],
  setupInstructions: { type: String, default: '' },
  canvasWidth: { type: Number, default: 800 },
  canvasHeight: { type: Number, default: 600 },
  sharedWithStaff: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Layout', layoutSchema);
