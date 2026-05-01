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
      'special_advisor',
      'meeting_organizer',
      'official_member',
      'member'
    ],
    default: 'member',
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending'],
    default: 'pending',
  },
  walletBalance: {
    type: Number,
    default: 0,
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
  transactionPin: String, // Hashed 4-digit PIN
  twoFactorSecret: String,
  twoFactorEnabled: { type: Boolean, default: false },
}, {
  timestamps: true,
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Encrypt password using bcrypt
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);

module.exports = User;
