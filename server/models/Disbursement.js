const mongoose = require('mongoose');

const disbursementSchema = new mongoose.Schema({
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    enum: ['loan', 'welfare', 'other'],
    required: true,
  },
  method: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'completed',
  }
}, {
  timestamps: true,
});

const Disbursement = mongoose.model('Disbursement', disbursementSchema);

module.exports = Disbursement;
