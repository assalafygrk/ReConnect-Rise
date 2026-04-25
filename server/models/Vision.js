const mongoose = require('mongoose');

const visionSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  content: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['finance', 'community', 'operations', 'security'],
    required: true,
  },
  upvotes: {
    type: Number,
    default: 0,
  },
  upvotedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }]
}, {
  timestamps: true,
});

const Vision = mongoose.model('Vision', visionSchema);

module.exports = Vision;
