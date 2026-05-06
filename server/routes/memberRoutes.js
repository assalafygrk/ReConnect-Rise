const express = require('express');
const router = express.Router();
const {
  getMembers,
  getMemberById,
  createMember,
  updateMemberStatus,
  updateMemberRole,
  deleteMember,
} = require('../controllers/memberController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getMembers)
  .post(protect, authorize('super_admin', 'group_leader'), createMember);

router.get('/:id', protect, getMemberById);
router.put('/:id/status', protect, authorize('super_admin', 'admin', 'group_leader'), updateMemberStatus);
router.put('/:id/role', protect, authorize('super_admin', 'admin'), updateMemberRole);
router.delete('/:id', protect, authorize('super_admin', 'admin', 'group_leader'), deleteMember);

module.exports = router;
