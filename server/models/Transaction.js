const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  type: {
    type: String,
    enum: ['credit', 'debit'],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  note: {
    type: String,
  },
  relatedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'declined'],
    default: 'completed',
  },
  category: {
    type: String,
    enum: ['transfer', 'withdrawal', 'deposit', 'contribution', 'gift', 'other'],
    default: 'other',
  },
  date: {
    type: Date,
    default: Date.now,
  }
}, {
  timestamps: true,
});

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
