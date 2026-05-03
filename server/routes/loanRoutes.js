const express = require('express');
const router = express.Router();
const {
  getLoans,
  requestLoan,
  leaderAction,
  memberNegotiate,
  treasurerAction,
  recordRepayment,
  updateLoanStatus,
} = require('../controllers/loanController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Any authenticated user can view (filtered by role in controller)
router.get('/', protect, getLoans);

// Any member can request a loan
router.post('/', protect, requestLoan);

// Group Leader: approve, negotiate, or decline (pending/negotiating → leader_approved/declined)
router.patch('/:id/leader', protect, authorize('groupleader', 'group_leader', 'admin', 'super_admin'), leaderAction);

// Member: reply to a negotiation (negotiating → pending)
router.patch('/:id/negotiate', protect, memberNegotiate);

// Treasurer: disburse or decline (leader_approved → active/declined)
router.patch('/:id/treasurer', protect, authorize('treasurer', 'admin', 'super_admin'), treasurerAction);

// Record repayment — Treasurer/Admin
router.post('/:id/repay', protect, authorize('treasurer', 'admin', 'super_admin'), recordRepayment);

// Legacy status update (kept for backward compat)
router.put('/:id/status', protect, authorize('treasurer', 'admin', 'super_admin', 'groupleader', 'group_leader'), updateLoanStatus);

module.exports = router;
