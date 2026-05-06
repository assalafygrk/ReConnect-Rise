const mongoose = require('mongoose');

/**
 * Weekly contribution deadline is every Thursday at 23:59:59.
 * System records contributions as they arrive.
 * If user pays more than the base amount, the remainder is recorded as bonus.
 * After 23:59 Thursday the week closes and a new week cycle begins.
 */
const contributionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  amount: {
    type: Number,
    required: true,
    min: [0, 'Amount must be non-negative'],
  },
  baseAmount: {
    type: Number,
  },
  bonus: {
    type: Number,
    default: 0,
  },
  type: {
    type: String,
    required: true,
    enum: ['weekly', 'general', 'other'],
    default: 'weekly',
  },
  // weekId format: "YYYY-WXX" or "YYYY-MM-DD" of the Monday of that week
  weekId: {
    type: String,
    index: true,
  },
  // Calculated deadline: Thursday 23:59:59 of that week
  deadline: {
    type: Date,
  },
  weekClosed: {
    type: Boolean,
    default: false,
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
  // How the payment was made
  paymentChannel: {
    type: String,
    enum: ['wallet', 'cash', 'bank_transfer'],
    default: 'cash',
  },
  // For general (pool) contributions — not tied to a week
  isGeneralContribution: {
    type: Boolean,
    default: false,
  },
  // Who manually marked this as paid (treasurer)
  markedPaidBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  note: {
    type: String,
  },
  reference: {
    type: String, // Bank transfer reference or wallet tx ID
  },
}, {
  timestamps: true,
});

// Compound index: one contribution record per user per week
contributionSchema.index({ user: 1, weekId: 1, type: 1 });

const Contribution = mongoose.model('Contribution', contributionSchema);

module.exports = Contribution;
