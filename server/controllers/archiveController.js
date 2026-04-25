const Archive = require('../models/Archive');

// @desc    Get all archives
// @route   GET /api/archives
// @access  Private
const getArchives = async (req, res) => {
  try {
    const archives = await Archive.find({}).sort({ createdAt: -1 });
    const gallery = archives.filter(a => a.type === 'gallery');
    const files = archives.filter(a => a.type === 'file');
    res.json({ gallery, files });
  } catch (err) {
    res.status(500);
    throw new Error('Failed to fetch archives');
  }
};

// @desc    Upload archive
// @route   POST /api/archives
// @access  Private
const uploadArchive = async (req, res) => {
  const { title, type } = req.body;
  // Since we don't have a real file upload mechanism, we'll mock the URL
  if (!title) {
    res.status(400);
    throw new Error('Title is required');
  }

  try {
    const archive = await Archive.create({
      title,
      type: type || 'gallery',
      url: `https://via.placeholder.com/600?text=${encodeURIComponent(title)}`,
      uploader: req.user._id,
    });
    res.status(201).json(archive);
  } catch (err) {
    res.status(500);
    throw new Error('Failed to create archive');
  }
};

module.exports = {
  getArchives,
  uploadArchive,
};
