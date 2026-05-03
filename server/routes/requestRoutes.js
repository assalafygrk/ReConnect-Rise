const express = require('express');
const router = express.Router();
const {
  getRequests,
  submitRequest,
  welfareOfficerAction,
  leaderAction,
  treasurerAction,
  updateRequestStatus,
} = require('../controllers/requestController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Any authenticated user (filtered by role in controller)
router.get('/', protect, getRequests);

// Any member submits a welfare request
router.post('/', protect, submitRequest);

// Stage 1: Welfare Officer → approve (welfare_approved) or decline
router.patch('/:id/welfare', protect, authorize('welfare', 'admin', 'super_admin'), welfareOfficerAction);

// Stage 2: Group Leader → approve (leader_approved) or decline
router.patch('/:id/leader', protect, authorize('groupleader', 'group_leader', 'admin', 'super_admin'), leaderAction);

// Stage 3: Treasurer → approve (disburse) or decline
router.patch('/:id/treasurer', protect, authorize('treasurer', 'admin', 'super_admin'), treasurerAction);

// Legacy (kept for backward compat)
router.patch('/:id/status', protect, authorize('welfare', 'admin', 'super_admin'), updateRequestStatus);
router.put('/:id/status', protect, authorize('welfare', 'admin', 'super_admin'), updateRequestStatus);

module.exports = router;
