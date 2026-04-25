const Vision = require('../models/Vision');

// @desc    Get all visions
// @route   GET /api/visions
// @access  Private
const getVisions = async (req, res) => {
  try {
    const visions = await Vision.find({}).populate('author', 'name email').sort({ createdAt: -1 });
    // Transform data to match frontend expectations
    const formattedVisions = visions.map(v => ({
      _id: v._id,
      content: v.content,
      category: v.category,
      upvotes: v.upvotes,
      author: v.author ? v.author.name : 'Unknown',
      createdAt: v.createdAt
    }));
    res.json(formattedVisions);
  } catch (err) {
    res.status(500);
    throw new Error('Failed to fetch visions');
  }
};

// @desc    Create a vision
// @route   POST /api/visions
// @access  Private
const createVision = async (req, res) => {
  const { content, category } = req.body;

  if (!content || !category) {
    res.status(400);
    throw new Error('Please add all fields');
  }

  try {
    const vision = await Vision.create({
      author: req.user._id,
      content,
      category,
    });
    
    // Return formatted vision
    const populatedVision = await Vision.findById(vision._id).populate('author', 'name email');
    res.status(201).json({
      _id: populatedVision._id,
      content: populatedVision.content,
      category: populatedVision.category,
      upvotes: populatedVision.upvotes,
      author: populatedVision.author.name,
      createdAt: populatedVision.createdAt
    });
  } catch (err) {
    res.status(500);
    throw new Error('Failed to create vision');
  }
};

// @desc    Upvote a vision
// @route   POST /api/visions/:id/upvote
// @access  Private
const upvoteVision = async (req, res) => {
  try {
    const vision = await Vision.findById(req.params.id);
    if (!vision) {
      res.status(404);
      throw new Error('Vision not found');
    }

    // Check if user already upvoted
    if (vision.upvotedBy.includes(req.user._id)) {
      res.status(400);
      throw new Error('You already upvoted this vision');
    }

    vision.upvotes += 1;
    vision.upvotedBy.push(req.user._id);
    await vision.save();

    res.json({ message: 'Upvoted successfully', upvotes: vision.upvotes });
  } catch (err) {
    res.status(500);
    throw new Error('Failed to upvote vision');
  }
};

module.exports = {
  getVisions,
  createVision,
  upvoteVision,
};
