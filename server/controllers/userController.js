const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Frontend uses different role slugs — map DB roles to frontend slugs
const ROLE_MAP = {
  super_admin: 'super_admin',   // no remapping needed — identical
  group_leader: 'groupleader',
  special_advisor: 'special-advisor',
  meeting_organizer: 'meeting-organizer',
  official_member: 'official-member',
};
const mapRole = (r) => ROLE_MAP[r] || r;

// @desc    Generate JWT — includes name, email, role for frontend parseJwt
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      name: user.name,
      email: user.email,
      role: mapRole(user.role),
    },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
};

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const authUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || email.length > 100) {
    res.status(400);
    throw new Error('Invalid email format');
  }

  if (!password || password.length < 8 || password.length > 64) {
    res.status(400);
    throw new Error('Password must be between 8 and 64 characters');
  }

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      token: generateToken(user),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: mapRole(user.role),
      }
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
};

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = async (req, res) => {
  const { 
    name, email, password, phone, role,
    firstName, lastName, middleName, 
    dateOfBirth, residentialAddress, 
    occupation, facialUpload 
  } = req.body;

  if (!email || email.length > 100) {
    res.status(400);
    throw new Error('Invalid email format');
  }

  if (!password || password.length < 8 || password.length > 64) {
    res.status(400);
    throw new Error('Password must be between 8 and 64 characters');
  }

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  const user = await User.create({
    name,
    email,
    password,
    phone,
    role: role || 'member',
    firstName,
    lastName,
    middleName,
    dateOfBirth,
    residentialAddress,
    occupation,
    facialUpload
  });

  if (user) {
    res.status(201).json({
      token: generateToken(user),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: mapRole(user.role),
      }
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      firstName: user.firstName,
      lastName: user.lastName,
      middleName: user.middleName,
      dateOfBirth: user.dateOfBirth,
      stateOfOrigin: user.stateOfOrigin,
      residentialAddress: user.residentialAddress,
      occupation: user.occupation,
      nextOfKinName: user.nextOfKinName,
      nextOfKinPhone: user.nextOfKinPhone,
      nextOfKinRelation: user.nextOfKinRelation,
      facialUpload: user.facialUpload,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.phone = req.body.phone || user.phone;
    user.firstName = req.body.firstName || user.firstName;
    user.lastName = req.body.lastName || user.lastName;
    user.middleName = req.body.middleName || user.middleName;
    user.dateOfBirth = req.body.dateOfBirth || user.dateOfBirth;
    user.stateOfOrigin = req.body.stateOfOrigin || user.stateOfOrigin;
    user.residentialAddress = req.body.residentialAddress || user.residentialAddress;
    user.occupation = req.body.occupation || user.occupation;
    user.nextOfKinName = req.body.nextOfKinName || user.nextOfKinName;
    user.nextOfKinPhone = req.body.nextOfKinPhone || user.nextOfKinPhone;
    user.nextOfKinRelation = req.body.nextOfKinRelation || user.nextOfKinRelation;
    user.facialUpload = req.body.facialUpload || user.facialUpload;

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: mapRole(updatedUser.role),
      phone: updatedUser.phone,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      middleName: updatedUser.middleName,
      dateOfBirth: updatedUser.dateOfBirth,
      stateOfOrigin: updatedUser.stateOfOrigin,
      residentialAddress: updatedUser.residentialAddress,
      occupation: updatedUser.occupation,
      nextOfKinName: updatedUser.nextOfKinName,
      nextOfKinPhone: updatedUser.nextOfKinPhone,
      nextOfKinRelation: updatedUser.nextOfKinRelation,
      facialUpload: updatedUser.facialUpload,
      token: generateToken(updatedUser),
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
};

// @desc    Update password
// @route   PATCH /api/users/profile/password
// @access  Private
const updatePassword = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    if (req.body.password) {
      user.password = req.body.password;
      await user.save();
      res.json({ message: 'Password updated successfully' });
    } else {
      res.status(400);
      throw new Error('Password is required');
    }
  } else {
    res.status(404);
    throw new Error('User not found');
  }
};

module.exports = {
  authUser,
  registerUser,
  getUserProfile,
  updateUserProfile,
  updatePassword,
};
