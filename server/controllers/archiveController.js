const Archive = require('../models/Archive');

// @desc    Get all archives
// @route   GET /api/archives
// @access  Private
const getArchives = async (req, res) => {
  try {
    const archives = await Archive.find({})
      .populate('uploader', 'name role facialUpload')
      .sort({ createdAt: -1 });
    
    const transformed = archives.map(a => {
      const isSuperAdmin = a.uploader?.role === 'super_admin';
      return {
        ...a._doc,
        uploaderName: isSuperAdmin ? 'ReConnect & Rise System' : (a.uploader?.name || 'Unknown'),
        uploaderAvatar: isSuperAdmin ? '/system-avatar.png' : a.uploader?.facialUpload
      };
    });

    const gallery = transformed.filter(a => a.type === 'gallery');
    const files = transformed.filter(a => a.type === 'file');
    const advice = transformed.filter(a => a.type === 'advice');
    res.json({ gallery, files, advice });
  } catch (err) {
    res.status(500);
    throw new Error('Failed to fetch archives');
  }
};

// @desc    Upload archive
// @route   POST /api/archives
// @access  Private
const uploadArchive = async (req, res) => {
  const { title, type, url, fileType, thumbnail, category } = req.body;
  
  // Strict role check for gallery/file repositories
  if (type !== 'advice') {
    const isAuthorized = ['super_admin', 'group_leader'].includes(req.user.role);
    if (!isAuthorized) {
      res.status(403);
      throw new Error('Unauthorized: Only administrators and leaders can upload documents');
    }
  }

  if (!title) {
    res.status(400);
    throw new Error('Title is required');
  }

  try {
    const archive = await Archive.create({
      title,
      type: type || 'file',
      url: url || `https://via.placeholder.com/600?text=${encodeURIComponent(title)}`,
      fileType: fileType || 'image',
      thumbnail: thumbnail,
      category: category || 'others',
      uploader: req.user._id,
    });
    
    const populated = await Archive.findById(archive._id).populate('uploader', 'name role');
    const isSuperAdmin = populated.uploader?.role === 'super_admin';

    res.status(201).json({
      ...populated._doc,
      uploaderName: isSuperAdmin ? 'ReConnect & Rise System' : (populated.uploader?.name || 'Unknown'),
    });
  } catch (err) {
    res.status(500);
    throw new Error('Failed to create archive');
  }
};

const upvoteArchive = async (req, res) => {
  try {
    const archive = await Archive.findById(req.params.id);
    if (!archive) {
      res.status(404);
      throw new Error('Archive not found');
    }
    archive.upvotes = (archive.upvotes || 0) + 1;
    await archive.save();
    res.json({ id: archive._id, upvotes: archive.upvotes });
  } catch (err) {
    res.status(500);
    throw new Error('Failed to upvote archive');
  }
};

const deleteArchive = async (req, res) => {
  try {
    const archive = await Archive.findById(req.params.id);
    if (!archive) {
      res.status(404);
      throw new Error('Archive not found');
    }

    // Authorization: Only uploader or super_admin/group_leader can delete
    const isAuthorized = 
      req.user.role === 'super_admin' || 
      req.user.role === 'group_leader' || 
      archive.uploader.toString() === req.user._id.toString();

    if (!isAuthorized) {
      res.status(403);
      throw new Error('Unauthorized: You do not have permission to delete this archive');
    }

    await archive.deleteOne();
    res.json({ message: 'Archive material removed from registry' });
  } catch (err) {
    res.status(500);
    throw new Error('Failed to delete archive');
  }
};

module.exports = {
  getArchives,
  uploadArchive,
  upvoteArchive,
  deleteArchive,
};
