const User = require('../models/User');
const bcrypt = require('bcryptjs');
const AuditLog = require('../models/AuditLog');

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
  const { firstName, lastName, middleName, email, phone, password, role, occupation, dateOfBirth, residentialAddress, verificationPassword } = req.body;

  // Group Leader verification
  if (req.user.role === 'group_leader') {
    if (!verificationPassword || !(await req.user.matchPassword(verificationPassword))) {
      res.status(401);
      throw new Error('Invalid verification password');
    }
  }

  if (!email || !password || !firstName || !lastName) {
    res.status(400);
    throw new Error('First name, last name, email and password are required');
  }
  
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('A member with this email already exists');
  }

  // Validate role limits if assigning a restricted role
  if (role && role !== 'member') {
    await validateRoleLimit(role);
  }

  const name = [firstName, middleName, lastName].filter(Boolean).join(' ');
  const user = await User.create({
    name, email, password, phone, role: role || 'member',
    firstName, lastName, middleName, occupation, dateOfBirth, residentialAddress,
    status: 'active',
    becameMemberAt: Date.now(),
  });

  if (user) {
    await AuditLog.create({
      user: req.user.name,
      action: 'MEMBER_CREATED',
      detail: `Created member account: ${user.name} (${user.email}) as ${user.role}`,
      category: 'member',
    });
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
  const { status, verificationPassword } = req.body;

  // Group Leader verification
  if (req.user.role === 'group_leader') {
    if (!verificationPassword || !(await req.user.matchPassword(verificationPassword))) {
      res.status(401);
      throw new Error('Invalid verification password');
    }
  }

  const member = await User.findById(req.params.id);
  if (member) {
    const oldStatus = member.status;
    member.status = status || member.status;
    const updatedMember = await member.save();
    await AuditLog.create({
      user: req.user.name,
      action: 'MEMBER_STATUS_UPDATE',
      detail: `Updated status of ${member.name} (${member.email}) from ${oldStatus} to ${status}`,
      category: 'member',
    });
    res.json(updatedMember);
  } else {
    res.status(404);
    throw new Error('Member not found');
  }
};

// @desc    Update member role
// @route   PUT /api/members/:id/role
// @access  Private/SuperAdmin
const updateMemberRole = async (req, res) => {
  const { role } = req.body;
  const member = await User.findById(req.params.id);

  if (!member) {
    res.status(404);
    throw new Error('Member not found');
  }

  if (role === member.role) return res.json(member);

  // Tenure check: 3 days to become official
  const threeDays = 3 * 24 * 60 * 60 * 1000;
  const tenure = Date.now() - member.becameMemberAt.getTime();
  
  const OFFICIAL_ROLES = ['group_leader', 'treasurer', 'welfare', 'special_advicer', 'official_member'];
  if (OFFICIAL_ROLES.includes(role) && tenure < threeDays) {
    res.status(400);
    throw new Error('Member must have at least 3 days tenure to become an official member');
  }

  // Validate role limits
  await validateRoleLimit(role);

  const oldRole = member.role;
  member.role = role;
  const updatedMember = await member.save();
  await AuditLog.create({
    user: req.user.name,
    action: 'MEMBER_ROLE_UPDATE',
    detail: `Promoted/demoted ${member.name} (${member.email}) from ${oldRole} to ${role}`,
    category: 'member',
  });
  res.json(updatedMember);
};

// @desc    Delete a member permanently
// @route   DELETE /api/members/:id
// @access  Private/Admin
const deleteMember = async (req, res) => {
  const { verificationPassword } = req.body;

  // Group Leader verification
  if (req.user.role === 'group_leader') {
    if (!verificationPassword || !(await req.user.matchPassword(verificationPassword))) {
      res.status(401);
      throw new Error('Invalid verification password');
    }
  }

  const member = await User.findById(req.params.id);
  if (member) {
    if (member.role === 'super_admin') {
      res.status(403);
      throw new Error('Cannot delete super admin');
    }
    await User.findByIdAndDelete(req.params.id);
    await AuditLog.create({
      user: req.user.name,
      action: 'MEMBER_DELETED',
      detail: `Deleted member account: ${member.name} (${member.email})`,
      category: 'member',
    });
    res.json({ message: 'Member permanently removed from the registry' });
  } else {
    res.status(404);
    throw new Error('Member not found');
  }
};

// Helper: Validate role limits
const validateRoleLimit = async (role) => {
  const OFFICIAL_ROLES = ['group_leader', 'treasurer', 'welfare', 'special_advicer', 'official_member'];
  const SINGLE_INSTANCE_ROLES = ['super_admin', 'group_leader', 'treasurer', 'welfare'];

  if (SINGLE_INSTANCE_ROLES.includes(role)) {
    const count = await User.countDocuments({ role });
    if (count >= 1) {
      throw new Error(`Only one ${role.replace('_', ' ')} is allowed`);
    }
  }

  if (OFFICIAL_ROLES.includes(role)) {
    const totalOfficialCount = await User.countDocuments({ 
      role: { $in: OFFICIAL_ROLES } 
    });
    // The user might be able to adjust this rate, but default is 20
    if (totalOfficialCount >= 20) {
      throw new Error('Maximum limit of 20 official members reached');
    }
  }
};

module.exports = {
  getMembers,
  getMemberById,
  createMember,
  updateMemberStatus,
  updateMemberRole,
  deleteMember,
};

