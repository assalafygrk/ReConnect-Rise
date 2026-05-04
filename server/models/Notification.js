const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false, // Optional if it's role-based
  },
  role: {
    type: String,
    enum: ['admin', 'treasurer', 'welfare_officer', 'group_leader', 'general_secretary', 'member', 'guest'],
    required: false,
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['info', 'warning', 'urgent', 'success'],
    default: 'info',
  },
  link: {
    type: String,
    required: false,
  },
  readBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  // For individual notifications, we can use a simple 'read' boolean
  // but for role-based notifications, we need to track who has read it.
  isGlobal: {
    type: Boolean,
    default: false,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
