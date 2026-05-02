const express = require('express');
const router = express.Router();
const {
  getMembers,
  getMemberById,
  createMember,
  updateMemberStatus,
  deleteMember,
} = require('../controllers/memberController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getMembers)
  .post(protect, authorize('admin', 'super_admin', 'group_leader'), createMember);

router.get('/:id', protect, getMemberById);
router.put('/:id/status', protect, authorize('admin', 'super_admin', 'group_leader'), updateMemberStatus);
router.delete('/:id', protect, authorize('admin', 'super_admin'), deleteMember);

module.exports = router;
