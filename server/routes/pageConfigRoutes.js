const express = require('express');
const router = express.Router();
const { getAllConfigs, setPageConfig } = require('../controllers/pageConfigController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', getAllConfigs); // Public for now since UI needs it to render
router.post('/', protect, authorize('admin'), setPageConfig);

module.exports = router;
