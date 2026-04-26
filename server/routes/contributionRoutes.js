const express = require('express');
const router = express.Router();
const {
  getContributions,
  recordContribution,
  recordBatchContributions,
  getWeeks,
} = require('../controllers/contributionController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, getContributions);
router.post('/', protect, authorize('admin', 'treasurer'), recordContribution);
router.get('/weeks', protect, getWeeks);
router.post('/batch', protect, authorize('admin', 'treasurer'), recordBatchContributions);

module.exports = router;
