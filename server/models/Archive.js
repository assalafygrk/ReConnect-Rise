const mongoose = require('mongoose');

const archiveSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['gallery', 'file', 'advice'],
    required: true,
  },
  fileType: {
    type: String,
    enum: ['image', 'video', 'pdf', 'pptx', 'voice', 'other'],
    default: 'other',
  },
  thumbnail: {
    type: String,
  },
  uploader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  upvotes: {
    type: Number,
    default: 0,
  },
  category: {
    type: String,
    default: 'others',
  }
}, {
  timestamps: true,
});

const Archive = mongoose.model('Archive', archiveSchema);

module.exports = Archive;
