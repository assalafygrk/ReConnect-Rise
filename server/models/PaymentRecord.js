const mongoose = require('mongoose');

const paymentRecordSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  reference: {
    type: String,
    required: true,
    unique: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'success', 'failed'],
    default: 'pending',
  },
  channel: {
    type: String,
    default: 'bank_transfer',
  },
  paymentResponse: {
    type: mongoose.Schema.Types.Mixed,
  },
}, {
  timestamps: true,
});

const PaymentRecord = mongoose.model('PaymentRecord', paymentRecordSchema);

module.exports = PaymentRecord;
