const jwt = require('jsonwebtoken');
const Settings = require('../models/Settings');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { authenticator } = require('otplib');
const AuditLog = require('../models/AuditLog');

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Helper for JWT generation (re-using logic from userController)
const ROLE_MAP = { super_admin: 'super_admin', group_leader: 'group_leader', treasurer: 'treasurer', welfare: 'welfare', special_advicer: 'special_advicer', official_member: 'official_member', member: 'member' };
const mapRole = (r) => ROLE_MAP[r] || r;
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

// ─── Helper: get or create singleton settings doc ───────────────────────────
async function getOrCreate() {
  let s = await Settings.findOne();
  if (!s) s = await Settings.create({});
  return s;
}

// GET /api/settings
const getSettings = async (req, res) => {
  const s = await getOrCreate();
  res.json(s);
};

// PATCH /api/settings  — super_admin/group_leader/treasurer only
const updateSettings = async (req, res) => {
  const s = await getOrCreate();
  const allowed = [
    'systemName', 'orgSlogan', 'logoUrl', 'maintenanceMode', 'allowRegistration', 'groupAnnouncement',
    'monthlySavingsTarget', 'loanInterestRate', 'welfareTarget', 'weeklyContributionAmount', 'officialMemberLimit',
    'loanFundTarget', 'maxLoanAmount', 'allowProfilePhotoChange',
    'enabledPages'
  ];
  const changedFields = [];
  allowed.forEach(key => {
    if (req.body[key] !== undefined && String(s[key]) !== String(req.body[key])) {
      changedFields.push(`${key}: ${s[key]} -> ${req.body[key]}`);
      s[key] = req.body[key];
    }
  });
  await s.save();
  if (changedFields.length > 0) {
    await AuditLog.create({
      user: req.user.name,
      action: 'SETTINGS_UPDATE',
      detail: `Modified system protocols: ${changedFields.join(', ')}`,
      category: 'admin'
    });
  }
  res.json(s);
};

// PATCH /api/settings/notifications  — any authenticated user (their own prefs)
const updateNotifications = async (req, res) => {
  // Stored as user-level on the User model; fall back to settings global defaults
  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  user.notifications = { ...(user.notifications || {}), ...req.body };
  await user.save();
  res.json({ notifications: user.notifications });
};

// POST /api/settings/change-password — any authenticated user
const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword)
    return res.status(400).json({ message: 'Both current and new password required' });
  if (newPassword.length < 8 || newPassword.length > 64)
    return res.status(400).json({ message: 'New password must be between 8 and 64 characters' });

  const user = await User.findById(req.user._id).select('+password');
  if (!user) return res.status(404).json({ message: 'User not found' });

  const match = await bcrypt.compare(currentPassword, user.password);
  if (!match) return res.status(401).json({ message: 'Current password is incorrect' });

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();
  res.json({ message: 'Password updated successfully' });
};

// PATCH /api/settings/security — admin: update admin panel security mode
const updateAdminSecurity = async (req, res) => {
  const { adminSecurityMode } = req.body;
  const valid = ['password', '2fa'/*, 'facial'*/];

  if (!valid.includes(adminSecurityMode)) {
    return res.status(400).json({ message: 'Invalid protocol: Selected security mode is not recognized' });
  }

  // Security Guardrail: Prevent activation of modes without corresponding credentials
  const superAdmin = await User.findOne({ role: 'super_admin' });
  if (!superAdmin) {
    return res.status(404).json({ message: 'Administrative Record not found' });
  }

  if (adminSecurityMode === '2fa' && !superAdmin.twoFactorSecret) {
    return res.status(400).json({
      message: 'Protocol Initialization Failed: Administrative 2FA Secret not found. Please configure 2FA in your personal settings first.'
    });
  }

  /*
  if (adminSecurityMode === 'facial' && !superAdmin.facialUpload) {
    return res.status(400).json({
      message: 'Protocol Initialization Failed: Administrative Facial Profile missing. Please upload a clear profile photo first.'
    });
  }
  */

  const s = await getOrCreate();
  const oldMode = s.adminSecurityMode;
  s.adminSecurityMode = adminSecurityMode || 'password';
  await s.save();
  await AuditLog.create({
    user: req.user.name,
    action: 'ADMIN_SECURITY_MODE_UPDATE',
    detail: `Changed admin panel unlock protocol from ${oldMode} to ${s.adminSecurityMode}`,
    category: 'security'
  });
  res.json({ adminSecurityMode: s.adminSecurityMode });
};

// PUT /api/settings/transaction-pin — any authenticated user
const updateTransactionPin = async (req, res) => {
  const { pin } = req.body;
  if (!pin || pin.length !== 4) {
    return res.status(400).json({ message: 'A 4-digit PIN is required' });
  }

  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).json({ message: 'User not found' });

  user.transactionPin = await bcrypt.hash(pin, 10);
  await user.save();
  await AuditLog.create({
    user: user.name,
    action: 'TRANSACTION_PIN_UPDATE',
    detail: `Configured/updated personal transaction security PIN`,
    category: 'security'
  });
  res.json({ message: 'Transaction PIN updated successfully' });
};

// POST /api/settings/2fa/setup — Initiate 2FA
const setup2FA = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).json({ message: 'User not found' });

  // Generate secret if not exists or if re-setting
  const secret = authenticator.generateSecret();
  const otpauth = authenticator.keyuri(user.email, 'ReConnect & Rise', secret);

  // Store secret temporarily (user must verify to enable)
  user.twoFactorSecret = secret;
  await user.save();

  res.json({ secret, otpauth });
};

// POST /api/settings/2fa/verify — Complete 2FA setup
const verify2FA = async (req, res) => {
  const { token } = req.body;
  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).json({ message: 'User not found' });

  const isValid = authenticator.verify({ token, secret: user.twoFactorSecret });
  if (!isValid) return res.status(400).json({ message: 'Invalid verification code' });

  user.twoFactorEnabled = true;
  await user.save();

  await AuditLog.create({
    user: user.name,
    action: '2FA_ENABLED',
    detail: `Successfully configured and enabled Two-Factor Authentication`,
    category: 'security'
  });

  res.json({
    message: 'Two-Factor Authentication enabled successfully',
    enabled: true,
    token: generateToken(user)
  });
};

// POST /api/settings/2fa/disable — Disable 2FA
const disable2FA = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).json({ message: 'User not found' });

  user.twoFactorEnabled = false;
  user.twoFactorSecret = undefined;
  await user.save();

  await AuditLog.create({
    user: user.name,
    action: '2FA_DISABLED',
    detail: `Deactivated Two-Factor Authentication security level`,
    category: 'security'
  });

  res.json({
    message: 'Two-Factor Authentication disabled',
    enabled: false,
    token: generateToken(user)
  });
};

// POST /api/settings/verify-admin — Verify Admin Panel Unlocking
const verifyAdminCredential = async (req, res) => {
  const { mode, credential, password } = req.body;

  // High-Security: Verify against the official Super Admin account
  const superAdmin = await User.findOne({ role: 'super_admin' }).select('+password');
  if (!superAdmin) {
    return res.status(404).json({ message: 'Primary Administrative Record not found in the Ledger' });
  }

  const s = await getOrCreate();

  // The system's target security mode
  const targetMode = s.adminSecurityMode || 'password';

  // Step 1: Always verify password if provided or if it's the only mode
  // If the user is in a 2-step flow, they might send 'password' mode first, or send both.
  if (mode === 'password' || targetMode !== 'password') {
    const pwToVerify = (mode === 'password') ? credential : password;
    if (!pwToVerify) {
      return res.status(401).json({ message: 'Administrative Password Required' });
    }
    const isMatch = await superAdmin.matchPassword(pwToVerify);
    if (!isMatch) return res.status(401).json({ message: 'Protocol Violation: Invalid Administrative Key' });

    // If we only needed password, we are done
    if (mode === 'password' && targetMode === 'password') {
      return res.json({ success: true, message: 'Administrative Access Authorized' });
    }

    // If we were just verifying password as step 1 of a multi-step flow
    if (mode === 'password' && targetMode !== 'password') {
      return res.json({ success: true, step: 1, nextMode: targetMode, message: 'Password Verified. Proceed to Second Factor.' });
    }
  }

  // Step 2: Verify Second Factor
  if (targetMode === '2fa') {
    if (!superAdmin.twoFactorSecret) {
      return res.status(400).json({ message: 'Protocol Error: Administrative 2FA not configured' });
    }
    const isValid = authenticator.verify({ token: credential, secret: superAdmin.twoFactorSecret });
    if (!isValid) return res.status(401).json({ message: 'Protocol Violation: Invalid TOTP Token' });
  } 
  /*
  else if (targetMode === 'facial') {
    if (!superAdmin.facialUpload) {
      return res.status(400).json({ message: 'Protocol Error: Administrative Facial Profile missing' });
    }
    // For now, we accept a "signature" that represents a successful scan
    if (!credential || credential.length < 20) {
      return res.status(401).json({ message: 'Protocol Violation: Invalid Biometric Signature' });
    }
  }
  */

  res.json({ success: true, message: 'Administrative Access Authorized' });
};

module.exports = {
  getSettings: asyncHandler(getSettings),
  updateSettings: asyncHandler(updateSettings),
  changePassword: asyncHandler(changePassword),
  updateNotifications: asyncHandler(updateNotifications),
  updateAdminSecurity: asyncHandler(updateAdminSecurity),
  updateTransactionPin: asyncHandler(updateTransactionPin),
  setup2FA: asyncHandler(setup2FA),
  verify2FA: asyncHandler(verify2FA),
  disable2FA: asyncHandler(disable2FA),
  verifyAdminCredential: asyncHandler(verifyAdminCredential),
};
