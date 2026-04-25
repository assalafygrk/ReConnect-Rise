const express = require('express');
const router = express.Router();
const {
  getMembers,
  getMemberById,
  updateMemberStatus,
} = require('../controllers/memberController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, getMembers);
router.get('/:id', protect, getMemberById);
router.put('/:id/status', protect, authorize('admin', 'group_leader'), updateMemberStatus);

module.exports = router;
