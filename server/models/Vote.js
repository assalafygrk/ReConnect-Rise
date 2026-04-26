const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  type: {
    type: String,
    enum: ['decision', 'election', 'budget', 'multiple_choice'],
    default: 'decision',
  },
  deadline: {
    type: Date,
  },
  amount: {
    type: Number,
  },
  totalEligible: {
    type: Number,
    default: 20,
  },
  options: [{
    type: String,
    required: true,
  }],
  results: {
    type: Map,
    of: Number,
    default: {},
  },
  voters: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  status: {
    type: String,
    enum: ['open', 'closed'],
    default: 'open',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }
}, {
  timestamps: true,
});

const Vote = mongoose.model('Vote', voteSchema);

module.exports = Vote;
