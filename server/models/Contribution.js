const mongoose = require('mongoose');

const contributionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  amount: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['welfare', 'loan_fund', 'other'],
  },
  weekId: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'rejected'],
    default: 'pending',
  },
  paymentMethod: {
    type: String,
  },
  reference: {
    type: String,
  },
}, {
  timestamps: true,
});

const Contribution = mongoose.model('Contribution', contributionSchema);

module.exports = Contribution;
