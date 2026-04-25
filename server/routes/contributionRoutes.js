const express = require('express');
const router = express.Router();
const {
  getContributions,
  recordContribution,
} = require('../controllers/contributionController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, getContributions);
router.post('/', protect, authorize('admin', 'treasurer'), recordContribution);

module.exports = router;
