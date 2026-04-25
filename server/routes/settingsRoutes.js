const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/settingsController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, getSettings);
router.patch('/', protect, authorize('admin'), updateSettings);

module.exports = router;
