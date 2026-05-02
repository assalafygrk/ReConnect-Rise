const User = require('../models/User');
const bcrypt = require('bcryptjs');

// @desc    Get all members
// @route   GET /api/members
// @access  Private
const getMembers = async (req, res) => {
  const members = await User.find({}).select('-password').sort({ createdAt: -1 });
  res.json(members);
};

// @desc    Get member by ID
// @route   GET /api/members/:id
// @access  Private
const getMemberById = async (req, res) => {
  const member = await User.findById(req.params.id).select('-password');
  if (member) {
    res.json(member);
  } else {
    res.status(404);
    throw new Error('Member not found');
  }
};

// @desc    Create a new member (admin only)
// @route   POST /api/members
// @access  Private/Admin
const createMember = async (req, res) => {
  const { firstName, lastName, middleName, email, phone, password, role, occupation, dateOfBirth, residentialAddress } = req.body;

  if (!email || !password || !firstName || !lastName) {
    res.status(400);
    throw new Error('First name, last name, email and password are required');
  }
  if (password.length < 8 || password.length > 64) {
    res.status(400);
    throw new Error('Password must be between 8 and 64 characters');
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('A member with this email already exists');
  }

  const name = [firstName, middleName, lastName].filter(Boolean).join(' ');
  const user = await User.create({
    name, email, password, phone, role: role || 'member',
    firstName, lastName, middleName, occupation, dateOfBirth, residentialAddress,
    status: 'active',
  });

  if (user) {
    res.status(201).json({ ...user.toObject(), password: undefined });
  } else {
    res.status(400);
    throw new Error('Invalid member data');
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

// @desc    Delete a member permanently
// @route   DELETE /api/members/:id
// @access  Private/Admin
const deleteMember = async (req, res) => {
  const member = await User.findById(req.params.id);
  if (member) {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Member permanently removed from the registry' });
  } else {
    res.status(404);
    throw new Error('Member not found');
  }
};

module.exports = {
  getMembers,
  getMemberById,
  createMember,
  updateMemberStatus,
  deleteMember,
};

