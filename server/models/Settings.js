const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  systemName: {
    type: String,
    default: 'ReConnect & Rise',
  },
  maintenanceMode: {
    type: Boolean,
    default: false,
  },
  allowRegistration: {
    type: Boolean,
    default: true,
  },
  welfareTarget: {
    type: Number,
    default: 1000000,
  },
  loanFundTarget: {
    type: Number,
    default: 5000000,
  }
}, {
  timestamps: true,
});

const Settings = mongoose.model('Settings', settingsSchema);

module.exports = Settings;
