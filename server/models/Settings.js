const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  // System
  systemName: { type: String, default: 'ReConnect & Rise' },
  orgSlogan: { type: String, default: 'Empowering Communities' },
  logoUrl: { type: String, default: '/logo.jpg' },
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

  // Module Nexus (Enabled Pages)
  enabledPages: {
    type: Object,
    default: {
      dashboard: true, contributions: true, members: true,
      disbursements: true, loans: true, requests: true,
      votes: true, meetings: true, chat: true, wallet: true,
      settings: true, profile: true, documentary: true, advice: true,
      login: true, register: true, id_card: true, nexus: true
    }
  }

}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
