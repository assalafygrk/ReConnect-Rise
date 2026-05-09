const jwt = require('jsonwebtoken');
const User = require('../models/User');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');
const { authenticator } = require('otplib');

// Helper to catch async errors
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Frontend uses different role slugs — map DB roles to frontend slugs
const ROLE_MAP = {
  super_admin: 'super_admin',
  group_leader: 'group_leader',
  treasurer: 'treasurer',
  welfare: 'welfare',
  special_advicer: 'special_advicer',
  official_member: 'official_member',
  member: 'member',
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
      twoFactorEnabled: !!user.twoFactorEnabled,
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

  const user = await User.findOne({ email }).select('+password');
  
  if (user && (await user.matchPassword(password))) {
    // Check if email is verified
    if (!user.isEmailVerified) {
      res.status(401);
      throw new Error('Please verify your email to login');
    }
    
    // If 2FA is enabled, don't issue the full token yet
    if (user.twoFactorEnabled) {
      // Issue a short-lived "pre-auth" token that only allows 2FA verification
      const preAuthToken = jwt.sign(
        { id: user._id, type: 'pre-auth' },
        process.env.JWT_SECRET,
        { expiresIn: '5m' }
      );
      
      return res.json({
        twoFactorRequired: true,
        preAuthToken,
        email: user.email
      });
    }

    res.json({
      token: generateToken(user),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: mapRole(user.role),
        twoFactorEnabled: !!user.twoFactorEnabled,
      }
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
};

// @desc    Verify 2FA code for Login
// @route   POST /api/users/login/2fa
// @access  Public
const verifyLogin2FA = async (req, res) => {
  const { token, preAuthToken } = req.body;

  if (!token || !preAuthToken) {
    return res.status(400).json({ message: 'Token and pre-auth session required' });
  }

  try {
    const decoded = jwt.verify(preAuthToken, process.env.JWT_SECRET);
    if (decoded.type !== 'pre-auth') {
      return res.status(401).json({ message: 'Invalid authentication session' });
    }

    const user = await User.findById(decoded.id);
    if (!user || !user.twoFactorSecret) {
      return res.status(404).json({ message: 'Security profile not found' });
    }

    const isValid = authenticator.verify({ token, secret: user.twoFactorSecret });
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid 2FA code' });
    }

    res.json({
      token: generateToken(user),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: mapRole(user.role),
        twoFactorEnabled: !!user.twoFactorEnabled,
      }
    });
  } catch (err) {
    res.status(401).json({ message: 'Session expired or invalid' });
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
    name, email, password, phone, role,
    firstName, lastName, middleName, 
    dateOfBirth, residentialAddress, 
    occupation, facialUpload 
  });

  if (user) {
    // Create verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.emailVerificationToken = crypto
      .createHash('sha256')
      .update(verificationToken)
      .digest('hex');
    
    // Set expiry (24 hours)
    user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;
    
    await user.save();

    // Verification URL
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;

    const message = `Welcome to ReConnect & Rise! Please verify your email by clicking the link below:\n\n${verificationUrl}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 10px;">
        <h2 style="color: #4a90e2; text-align: center;">Welcome to ReConnect & Rise</h2>
        <p>Hi ${user.name},</p>
        <p>Thank you for registering. Please click the button below to verify your email address and activate your account:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #4a90e2; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify Email Address</a>
        </div>
        <p>If the button doesn't work, you can also copy and paste the following link into your browser:</p>
        <p style="word-break: break-all; color: #4a90e2;">${verificationUrl}</p>
        <p>This link will expire in 24 hours.</p>
        <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 20px 0;">
        <p style="font-size: 12px; color: #888888; text-align: center;">If you did not create an account, please ignore this email.</p>
      </div>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Email Verification - ReConnect & Rise',
        message,
        html
      });

      res.status(201).json({
        message: 'Registration successful. Please check your email to verify your account.',
        userId: user._id
      });
    } catch (error) {
      console.error('Email could not be sent', error);
      res.status(201).json({
        message: 'Registration successful, but verification email could not be sent. Please contact support.',
        userId: user._id
      });
    }
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id).select('+transactionPin');

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
      hasTransactionPin: !!user.transactionPin,
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

// @desc    Set/Update Transaction PIN
// @route   PATCH /api/users/profile/pin
// @access  Private
const setTransactionPin = async (req, res) => {
  const { pin } = req.body;
  
  if (!pin || pin.length !== 4 || !/^\d{4}$/.test(pin)) {
    res.status(400);
    throw new Error('Transaction PIN must be exactly 4 digits');
  }

  const user = await User.findById(req.user._id);
  if (user) {
    user.transactionPin = pin;
    await user.save();
    res.json({ message: 'Transaction PIN updated successfully' });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
};

// @desc    Change Transaction PIN (Requires Old PIN)
// @route   PATCH /api/users/profile/pin/change
// @access  Private
const changeTransactionPin = async (req, res) => {
  const { oldPin, newPin } = req.body;

  if (!newPin || newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
    res.status(400);
    throw new Error('New Transaction PIN must be exactly 4 digits');
  }

  const user = await User.findById(req.user._id).select('+transactionPin');
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // If user has a PIN, they MUST provide the old one correctly
  if (user.transactionPin) {
    if (!oldPin) {
      res.status(400);
      throw new Error('Current PIN is required to authorize change');
    }
    const isMatch = await user.matchTransactionPin(oldPin);
    if (!isMatch) {
      res.status(401);
      throw new Error('Invalid current Transaction PIN');
    }
  }

  user.transactionPin = newPin;
  await user.save();
  res.json({ message: 'Transaction PIN successfully updated' });
};

module.exports = {
  authUser: asyncHandler(authUser),
  verifyLogin2FA: asyncHandler(verifyLogin2FA),
  registerUser: asyncHandler(registerUser),
  getUserProfile: asyncHandler(getUserProfile),
  updateUserProfile: asyncHandler(updateUserProfile),
  updatePassword: asyncHandler(updatePassword),
  setTransactionPin: asyncHandler(setTransactionPin),
  changeTransactionPin: asyncHandler(changeTransactionPin),
  verifyEmail: asyncHandler(async (req, res) => {
    const { token } = req.params;

    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      res.status(400);
      throw new Error('Invalid or expired verification token');
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    user.status = 'active'; // Activate user upon verification
    await user.save();

    res.json({
      message: 'Email verified successfully! You can now login.',
      token: generateToken(user),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: mapRole(user.role),
      }
    });
  }),
  resendVerificationEmail: asyncHandler(async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    if (user.isEmailVerified) {
      res.status(400);
      throw new Error('Email is already verified');
    }

    // Create verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.emailVerificationToken = crypto
      .createHash('sha256')
      .update(verificationToken)
      .digest('hex');
    
    // Set expiry (24 hours)
    user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;
    
    await user.save();

    // Verification URL
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;

    const message = `Please verify your email by clicking the link below:\n\n${verificationUrl}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 10px;">
        <h2 style="color: #4a90e2; text-align: center;">ReConnect & Rise</h2>
        <p>Hi ${user.name},</p>
        <p>You requested to resend the verification email. Please click the button below to verify your email address:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #4a90e2; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify Email Address</a>
        </div>
        <p>If the button doesn't work, you can also copy and paste the following link into your browser:</p>
        <p style="word-break: break-all; color: #4a90e2;">${verificationUrl}</p>
        <p>This link will expire in 24 hours.</p>
        <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 20px 0;">
      </div>
    `;

    await sendEmail({
      email: user.email,
      subject: 'Resend Email Verification - ReConnect & Rise',
      message,
      html
    });

    res.json({ message: 'Verification email sent successfully' });
  }),
};
