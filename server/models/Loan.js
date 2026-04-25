const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  amount: {
    type: Number,
    required: true,
  },
  purpose: {
    type: String,
    required: true,
  },
  duration: {
    type: Number, // in months
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'active', 'disbursed', 'rejected', 'repaid', 'declined'],
    default: 'pending',
  },
  balance: {
    type: Number,
    default: 0,
  },
  amountRepaid: {
    type: Number,
    default: 0,
  },
  interestRate: {
    type: Number,
    default: 10, // 10%
  },
  repaymentDate: {
    type: Date,
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

const Loan = mongoose.model('Loan', loanSchema);

module.exports = Loan;
