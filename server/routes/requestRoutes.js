const express = require('express');
const router = express.Router();
const { getRequests, submitRequest, updateRequestStatus } = require('../controllers/requestController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, getRequests);
router.post('/', protect, submitRequest);
router.patch('/:id/status', protect, authorize('admin', 'welfare'), updateRequestStatus);

module.exports = router;
