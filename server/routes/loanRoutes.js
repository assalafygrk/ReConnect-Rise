const express = require('express');
const router = express.Router();
const {
  getLoans,
  requestLoan,
  updateLoanStatus,
  recordRepayment,
} = require('../controllers/loanController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, getLoans);
router.post('/', protect, requestLoan);
router.put('/:id/status', protect, authorize('admin', 'treasurer'), updateLoanStatus);
router.post('/:id/repay', protect, authorize('admin', 'treasurer'), recordRepayment);

module.exports = router;
