const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  speciality: { type: String, default: 'General' },
  status: {
    type: String,
    enum: ['Not Assigned', 'Pending', 'In Progress', 'Done'],
    default: 'Not Assigned'
  },
  dueDate: { type: Date, default: null },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' }
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);
