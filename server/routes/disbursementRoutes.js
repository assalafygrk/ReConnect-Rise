const express = require('express');
const router = express.Router();
const { getDisbursements, addDisbursement, updateDisbursementStatus } = require('../controllers/disbursementController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, authorize('admin', 'treasurer', 'group_leader'), getDisbursements);
router.post('/', protect, authorize('admin', 'treasurer'), addDisbursement);
router.patch('/:id/status', protect, authorize('admin', 'treasurer'), updateDisbursementStatus);

module.exports = router;
