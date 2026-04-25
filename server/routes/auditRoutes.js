const express = require('express');
const router = express.Router();
const { getLogs, addLog } = require('../controllers/auditController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, authorize('admin'), getLogs);
router.post('/', protect, addLog);

module.exports = router;
