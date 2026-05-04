const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead, readAll, sendNotification } = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getNotifications);
router.post('/', sendNotification);
router.patch('/:id/read', markAsRead);
router.patch('/read-all', readAll);

module.exports = router;
