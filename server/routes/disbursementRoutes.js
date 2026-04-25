const express = require('express');
const router = express.Router();
const { getDisbursements, addDisbursement } = require('../controllers/disbursementController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, authorize('admin', 'treasurer'), getDisbursements);
router.post('/', protect, authorize('admin', 'treasurer'), addDisbursement);

module.exports = router;
