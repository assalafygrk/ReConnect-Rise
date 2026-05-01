const Settings = require('../models/Settings');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { authenticator } = require('otplib');

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

// PATCH /api/settings  — admin/treasurer only
const updateSettings = async (req, res) => {
  const s = await getOrCreate();
  const allowed = [
    'systemName', 'maintenanceMode', 'allowRegistration', 'groupAnnouncement',
    'monthlySavingsTarget', 'loanInterestRate', 'welfareTarget',
    'loanFundTarget', 'maxLoanAmount', 'allowProfilePhotoChange'
  ];
  allowed.forEach(key => {
    if (req.body[key] !== undefined) s[key] = req.body[key];
  });
  await s.save();
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
  if (newPassword.length < 8)
    return res.status(400).json({ message: 'New password must be at least 8 characters' });

  const user = await User.findById(req.user._id).select('+password');
  if (!user) return res.status(404).json({ message: 'User not found' });

  const match = await bcrypt.compare(currentPassword, user.password);
  if (!match) return res.status(401).json({ message: 'Current password is incorrect' });

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();
  res.json({ message: 'Password updated successfully' });
};

// PUT /api/settings/users/:id/role — super_admin/admin only
const updateUserRole = async (req, res) => {
  const { role } = req.body;
  const validRoles = ['super_admin', 'admin', 'group_leader', 'treasurer', 'welfare',
    'special_advisor', 'meeting_organizer', 'official_member', 'member'];
  if (!validRoles.includes(role))
    return res.status(400).json({ message: `Invalid role: ${role}` });

  // Protect: only super_admin can assign super_admin
  if (role === 'super_admin' && req.user.role !== 'super_admin')
    return res.status(403).json({ message: 'Only Super Admin can grant this role' });

  const target = await User.findByIdAndUpdate(
    req.params.id,
    { role },
    { new: true }
  ).select('-password');
  if (!target) return res.status(404).json({ message: 'User not found' });
  res.json(target);
};

// PUT /api/settings/users/:id/status — admin only
const updateUserStatus = async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['active', 'pending', 'suspended'];
  if (!validStatuses.includes(status))
    return res.status(400).json({ message: `Invalid status: ${status}` });

  const target = await User.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  ).select('-password');
  if (!target) return res.status(404).json({ message: 'User not found' });
  res.json(target);
};

// PATCH /api/settings/security — admin: update admin panel security mode
const updateAdminSecurity = async (req, res) => {
  const { adminSecurityMode } = req.body;
  const valid = ['password', '2fa', 'facial'];
  if (!valid.includes(adminSecurityMode))
    return res.status(400).json({ message: 'Invalid security mode' });

  const s = await getOrCreate();
  s.adminSecurityMode = adminSecurityMode;
  await s.save();
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

  const isValid = authenticator.check(token, user.twoFactorSecret);
  if (!isValid) return res.status(400).json({ message: 'Invalid verification code' });

  user.twoFactorEnabled = true;
  await user.save();

  res.json({ message: 'Two-Factor Authentication enabled successfully', enabled: true });
};

// POST /api/settings/2fa/disable — Disable 2FA
const disable2FA = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).json({ message: 'User not found' });

  user.twoFactorEnabled = false;
  user.twoFactorSecret = undefined;
  await user.save();

  res.json({ message: 'Two-Factor Authentication disabled', enabled: false });
};

module.exports = {
  getSettings,
  updateSettings,
  changePassword,
  updateNotifications,
  updateUserRole,
  updateUserStatus,
  updateAdminSecurity,
  updateTransactionPin,
  setup2FA,
  verify2FA,
  disable2FA,
};
