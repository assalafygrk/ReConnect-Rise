const express = require('express');
const router = express.Router();
const {
  getSettings, updateSettings, changePassword,
  updateNotifications, updateUserRole, updateUserStatus,
  updateAdminSecurity, updateTransactionPin,
  setup2FA, verify2FA, disable2FA,
} = require('../controllers/settingsController');
const { protect, authorize } = require('../middleware/authMiddleware');

// System settings
router.get('/', protect, getSettings);
router.patch('/', protect, authorize('admin', 'treasurer', 'super_admin'), updateSettings);

// Personal password change (any logged-in user)
router.post('/change-password', protect, changePassword);

// Notification preferences (any logged-in user)
router.patch('/notifications', protect, updateNotifications);

// Admin security mode
router.patch('/security', protect, authorize('admin', 'super_admin'), updateAdminSecurity);

// Transaction PIN (any logged-in user)
router.put('/transaction-pin', protect, updateTransactionPin);

// User management (admin / super_admin only)
router.put('/users/:id/role', protect, authorize('admin', 'super_admin'), updateUserRole);
router.put('/users/:id/status', protect, authorize('admin', 'super_admin'), updateUserStatus);

// Two-Factor Authentication (any logged-in user)
router.post('/2fa/setup', protect, setup2FA);
router.post('/2fa/verify', protect, verify2FA);
router.post('/2fa/disable', protect, disable2FA);

module.exports = router;
