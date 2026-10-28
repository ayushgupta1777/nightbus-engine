const mongoose = require('mongoose');

const qaFeedbackSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    default: ''
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  type: {
    type: String,
    enum: ['bug', 'improvement', 'feature', 'ui_ux'],
    default: 'bug'
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'resolved', 'closed'],
    default: 'pending'
  },
  route: {
    type: String,
    required: true,
    trim: true
  },
  screenName: {
    type: String,
    trim: true,
    default: 'UnknownScreen'
  },
  userRole: {
    type: String,
    trim: true,
    default: 'customer'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  viewport: {
    mode: { type: String, default: 'phone' },
    width: { type: Number, default: 0 },
    height: { type: Number, default: 0 }
  },
  consoleLogs: [{
    type: String
  }],
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  aiResolutionNotes: {
    type: String,
    default: ''
  },
  resolvedAt: {
    type: Date,
    default: null
  }
}, { timestamps: true });

qaFeedbackSchema.index({ status: 1, createdAt: -1 });
qaFeedbackSchema.index({ route: 1 });

module.exports = mongoose.model('QaFeedback', qaFeedbackSchema);
