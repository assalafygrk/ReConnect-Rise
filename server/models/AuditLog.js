const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  user: {
    type: String,
    required: true,
  },
  action: {
    type: String,
    required: true,
  },
  detail: {
    type: String,
  },
  category: {
    type: String,
    enum: ['admin', 'system', 'member', 'security'],
    default: 'system',
  },
  timestamp: {
    type: Date,
    default: Date.now,
  }
}, {
  timestamps: true,
});

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

module.exports = AuditLog;
