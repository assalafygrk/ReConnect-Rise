const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  zoomLink: {
    type: String,
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  attendees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  agenda: [String],
  minutes: String,
  status: {
    type: String,
    enum: ['scheduled', 'upcoming', 'completed', 'past', 'cancelled'],
    default: 'scheduled',
  }
}, {
  timestamps: true,
});

const Meeting = mongoose.model('Meeting', meetingSchema);

module.exports = Meeting;
