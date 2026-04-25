const User = require('../models/User');

// @desc    Get all members
// @route   GET /api/members
// @access  Private/Admin/Treasurer/GroupLeader
const getMembers = async (req, res) => {
  const members = await User.find({}).select('-password');
  res.json(members);
};

// @desc    Get member by ID
// @route   GET /api/members/:id
// @access  Private/Admin
const getMemberById = async (req, res) => {
  const member = await User.findById(req.params.id).select('-password');

  if (member) {
    res.json(member);
  } else {
    res.status(404);
    throw new Error('Member not found');
  }
};

// @desc    Update member status
// @route   PUT /api/members/:id/status
// @access  Private/Admin
const updateMemberStatus = async (req, res) => {
  const member = await User.findById(req.params.id);

  if (member) {
    member.status = req.body.status || member.status;
    const updatedMember = await member.save();
    res.json(updatedMember);
  } else {
    res.status(404);
    throw new Error('Member not found');
  }
};

module.exports = {
  getMembers,
  getMemberById,
  updateMemberStatus,
};
