const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
  },
  role: {
    type: String,
    enum: [
      'super_admin',
      'admin',
      'group_leader',
      'treasurer',
      'welfare',
      'special_advicer',
      'official_member',
      'member'
    ],
    default: 'member',
  },
  becameMemberAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending', 'suspended'],
    default: 'pending',
  },
  walletBalance: {
    type: Number,
    default: 0,
  },
  transactionPin: {
    type: String,
    select: false,
  },
  firstName: String,
  lastName: String,
  middleName: String,
  dateOfBirth: Date,
  stateOfOrigin: String,
  residentialAddress: String,
  occupation: String,
  nextOfKinName: String,
  nextOfKinPhone: String,
  nextOfKinRelation: String,
  facialUpload: String, // Base64 or URL
  notifications: {
    push: { type: Boolean, default: true },
    email: { type: Boolean, default: false },
    app: { type: Boolean, default: true },
  },
  twoFactorSecret: String,
  twoFactorEnabled: { type: Boolean, default: false },
  paymentPointVirtualAccount: String,
  paymentPointBankName: String,
  paymentPointAccountName: String,
  paymentPointCustomerId: String,
  lastSeen: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Match user entered transaction PIN to hashed PIN in database
userSchema.methods.matchTransactionPin = async function (enteredPin) {
  if (!this.transactionPin) return false;
  return await bcrypt.compare(enteredPin, this.transactionPin);
};

// Encrypt password & transaction PIN using bcrypt
userSchema.pre('save', async function () {
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }

  if (this.isModified('transactionPin')) {
    const salt = await bcrypt.genSalt(10);
    this.transactionPin = await bcrypt.hash(this.transactionPin, salt);
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
