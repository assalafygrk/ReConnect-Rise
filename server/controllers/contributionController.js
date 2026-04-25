const Contribution = require('../models/Contribution');

// @desc    Get all contributions
// @route   GET /api/contributions
// @access  Private
const getContributions = async (req, res) => {
  const { week } = req.query;
  const query = week ? { weekId: week } : {};
  
  const contributions = await Contribution.find(query).populate('user', 'name email');
  res.json(contributions);
};

// @desc    Record a new contribution
// @route   POST /api/contributions
// @access  Private/Treasurer/Admin
const recordContribution = async (req, res) => {
  const { memberId, weekId, type, amount } = req.body;

  const contribution = await Contribution.create({
    user: memberId,
    weekId, // Note: I should add this to the model if I haven't
    type,
    amount,
    status: 'confirmed' // Assuming treasurer recording is auto-confirmed for now
  });

  if (contribution) {
    res.status(201).json(contribution);
  } else {
    res.status(400);
    throw new Error('Invalid contribution data');
  }
};

module.exports = {
  getContributions,
  recordContribution,
};
