const mongoose = require('mongoose');

/**
 * Disbursement workflow:
 * 1. Group Leader creates disbursement request → status: 'pending'
 * 2. Treasurer approves/declines (with reason) → 'approved' | 'declined'
 * 3. On approval: auto-credit wallet (if method = 'wallet') or mark for manual handover
 * 4. Treasurer marks as completed → 'completed'
 *
 * Note: Disbursement can also be generated from Welfare or Loan approval flows,
 * but Group Leaders may also create standalone disbursement requests.
 */
const disbursementSchema = new mongoose.Schema({
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: [1, 'Amount must be positive'],
  },
  type: {
    type: String,
    enum: ['loan', 'welfare', 'general', 'other'],
    default: 'general',
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },

  // ── Payment method ────────────────────────────────────────────────────────
  method: {
    type: String,
    enum: ['wallet', 'bank_transfer', 'cash'],
    default: 'wallet',
    required: true,
  },
  // For bank transfers
  bankAccountNumber: {
    type: String,
  },
  bankName: {
    type: String,
  },
  bankAccountName: {
    type: String,
  },

  // ── Workflow ──────────────────────────────────────────────────────────────
  status: {
    type: String,
    enum: ['pending', 'approved', 'declined', 'completed'],
    default: 'pending',
  },
  declineReason: {
    type: String,
  },

  // ── Audit trail ──────────────────────────────────────────────────────────
  // Group Leader who created this request
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  // Treasurer who approved/declined
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  reviewedAt: {
    type: Date,
  },
  completedAt: {
    type: Date,
  },

  // Reference to source document if this was auto-generated
  sourceModel: {
    type: String,
    enum: ['Request', 'Loan', null],
    default: null,
  },
  sourceId: {
    type: mongoose.Schema.Types.ObjectId,
  },
}, {
  timestamps: true,
});

const Disbursement = mongoose.model('Disbursement', disbursementSchema);

module.exports = Disbursement;
