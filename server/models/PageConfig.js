const mongoose = require('mongoose');

const pageConfigSchema = new mongoose.Schema({
  pageId: {
    type: String,
    required: true,
    unique: true,
  },
  config: {
    type: Object,
    required: true,
  }
}, {
  timestamps: true,
});

const PageConfig = mongoose.model('PageConfig', pageConfigSchema);

module.exports = PageConfig;
