const mongoose = require('mongoose');

/**
 * Welfare Request workflow (3-stage):
 * 1. Member submits → status: 'pending'
 * 2. Welfare Officer reviews → 'welfare_approved' (forwarded to Group Leader) | 'declined'
 * 3. Group Leader reviews → 'leader_approved' (forwarded to Treasurer) | 'declined'
 * 4. Treasurer approves → 'approved' (auto-disburses via wallet or marks cash) | 'declined'
 */
const requestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  type: {
    type: String,
    required: true,
    // Allow flexible categories — custom categories can be added via settings
  },
  amount: {
    type: Number,
    required: true,
    min: [1, 'Amount must be positive'],
  },
  description: {
    type: String,
    required: true,
  },

  // ── Workflow stages ──────────────────────────────────────────────────────
  status: {
    type: String,
    enum: [
      'pending',           // Member submitted
      'welfare_approved',  // Welfare Officer approved — at Group Leader
      'leader_approved',   // Group Leader approved — at Treasurer
      'approved',          // Treasurer approved, funds disbursed
      'declined',          // Rejected at any stage
    ],
    default: 'pending',
  },

  // How the beneficiary will receive funds
  paymentMethod: {
    type: String,
    enum: ['wallet', 'cash'],
    default: 'wallet',
  },

  // ── Audit trail ──────────────────────────────────────────────────────────
  declineReason: {
    type: String,
  },

  welfareApprovedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  welfareApprovedAt: {
    type: Date,
  },

  leaderApprovedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  leaderApprovedAt: {
    type: Date,
  },

  treasurerApprovedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  disbursedAt: {
    type: Date,
  },

  // Legacy fields — kept for backward compat
  note: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

const Request = mongoose.model('Request', requestSchema);

module.exports = Request;
