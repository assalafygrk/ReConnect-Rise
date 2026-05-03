const express = require('express');
const router = express.Router();
const {
  getDisbursements,
  addDisbursement,
  treasurerAction,
  markCompleted,
  updateDisbursementStatus,
} = require('../controllers/disbursementController');
const { protect, authorize } = require('../middleware/authMiddleware');

// View disbursements (role-filtered in controller)
router.get('/', protect, getDisbursements);

// Group Leader creates a disbursement request
router.post('/', protect, authorize('groupleader', 'group_leader', 'admin', 'super_admin'), addDisbursement);

// Treasurer approves or declines
router.patch('/:id/treasurer', protect, authorize('treasurer', 'admin', 'super_admin'), treasurerAction);

// Mark completed (for bank/cash transfers after physical execution)
router.patch('/:id/complete', protect, authorize('treasurer', 'admin', 'super_admin'), markCompleted);

// Legacy status update (kept for backward compat)
router.patch('/:id/status', protect, authorize('treasurer', 'admin', 'super_admin'), updateDisbursementStatus);

module.exports = router;
