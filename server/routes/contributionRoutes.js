const express = require('express');
const router = express.Router();
const {
  getContributions,
  getWeeklyStatus,
  markPaid,
  payViaWallet,
  recordGeneralContribution,
  getWeeks,
  recordBatchContributions,
  recordHistory,
} = require('../controllers/contributionController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Any authenticated user
router.get('/', protect, getContributions);
router.get('/weeks', protect, getWeeks);

// Current week status — treasurer/leader/admin see all; others see own
router.get('/weekly-status', protect, getWeeklyStatus);

// Member self-service wallet payment
router.post('/pay-via-wallet', protect, payViaWallet);

// Treasurer manually marks a member paid
router.post('/mark-paid', protect, authorize('treasurer', 'admin', 'super_admin'), markPaid);

// Record historical data (Bulk)
router.post('/record-history', protect, authorize('treasurer', 'admin', 'super_admin'), recordHistory);

// General (pool) contribution — any member; treasurer can record on behalf
router.post('/general', protect, recordGeneralContribution);

// Batch sync (legacy — treasurer/admin only)
router.post('/batch', protect, authorize('treasurer', 'admin', 'super_admin'), recordBatchContributions);

module.exports = router;
