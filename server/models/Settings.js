const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  // System
  systemName: { type: String, default: 'ReConnect & Rise' },
  maintenanceMode: { type: Boolean, default: false },
  allowRegistration: { type: Boolean, default: true },
  groupAnnouncement: { type: String, default: '' },

  // Financial guardrails (Treasurer)
  monthlySavingsTarget: { type: Number, default: 250000 },
  loanInterestRate: { type: Number, default: 0 },
  welfareTarget: { type: Number, default: 1000000 },
  loanFundTarget: { type: Number, default: 5000000 },
  maxLoanAmount: { type: Number, default: 0 },

  // Notification preferences (per-user, stored globally as defaults)
  defaultNotifications: {
    push: { type: Boolean, default: true },
    email: { type: Boolean, default: false },
    app: { type: Boolean, default: true },
  },

  // Admin panel security mode: 'password' | '2fa' | 'facial'
  adminSecurityMode: { type: String, default: 'password' },
  allowProfilePhotoChange: { type: Boolean, default: false },

}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
