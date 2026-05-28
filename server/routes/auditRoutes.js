const express = require('express');
const router = express.Router();
const { getLogs, addLog, clearLogs } = require('../controllers/auditController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, authorize('admin'), getLogs);
router.post('/', protect, addLog);
router.delete('/', protect, authorize('admin'), clearLogs);

module.exports = router;
