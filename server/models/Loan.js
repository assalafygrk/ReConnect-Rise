const mongoose = require('mongoose');

/**
 * Loan workflow (correct order):
 * 1. member submits → status: 'pending'
 * 2. Group Leader reviews/negotiates → status: 'negotiating' | 'leader_approved' | 'declined'
 * 3. Treasurer disburses → status: 'active' (if wallet) or 'disbursed_cash' (if cash)
 * 4. Member repays → status: 'repaid'
 *
 * If vault balance is insufficient when member submits, request is blocked.
 */
const loanSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  amount: {
    type: Number,
    required: true,
    min: [1, 'Loan amount must be positive'],
  },
  purpose: {
    type: String,
    required: true,
  },
  duration: {
    type: Number, // in months
    required: true,
  },
  interestRate: {
    type: Number,
    default: 0,
  },
  // How the member wants to receive the funds
  disbursementMethod: {
    type: String,
    enum: ['wallet', 'cash'],
    default: 'wallet',
  },

  // ── Workflow stages ──────────────────────────────────────────────────────
  status: {
    type: String,
    enum: [
      'pending',          // Member submitted — awaiting Group Leader
      'negotiating',      // Group Leader is in discussion with member
      'leader_approved',  // Group Leader approved — forwarded to Treasurer
      'active',           // Treasurer approved, disbursed to wallet
      'disbursed_cash',   // Treasurer approved, cash handed over
      'repaid',           // Fully repaid
      'declined',         // Rejected at any stage
    ],
    default: 'pending',
  },

  // ── Financial tracking ───────────────────────────────────────────────────
  balance: {
    type: Number,
    default: 0,
  },
  amountRepaid: {
    type: Number,
    default: 0,
  },
  repaymentDate: {
    type: Date,
  },

  // ── Audit trail ──────────────────────────────────────────────────────────
  negotiationNotes: {
    type: String, // Agreed terms between member and Group Leader
  },
  declineReason: {
    type: String,
  },

  leaderApprovedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  leaderApprovedAt: {
    type: Date,
  },

  disbursedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  disbursedAt: {
    type: Date,
  },

  // Legacy field — kept for backward compat
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

const Loan = mongoose.model('Loan', loanSchema);

module.exports = Loan;
