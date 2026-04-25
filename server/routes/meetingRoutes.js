const express = require('express');
const router = express.Router();
const { getMeetings, addMeeting } = require('../controllers/meetingController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, getMeetings);
router.post('/', protect, authorize('admin', 'meeting_organizer', 'group_leader'), addMeeting);

module.exports = router;
