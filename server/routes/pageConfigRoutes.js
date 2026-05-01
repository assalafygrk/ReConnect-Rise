const express = require('express');
const router = express.Router();
const { getAllConfigs, setPageConfig, deletePageConfig, deleteAllPageConfigs } = require('../controllers/pageConfigController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', getAllConfigs); // Public for now since UI needs it to render
router.post('/', protect, authorize('admin', 'super_admin'), setPageConfig);
router.delete('/', protect, authorize('admin', 'super_admin'), deleteAllPageConfigs);
router.delete('/:pageId', protect, authorize('admin', 'super_admin'), deletePageConfig);

module.exports = router;
