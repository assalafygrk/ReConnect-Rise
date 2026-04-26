const express = require('express');
const router = express.Router();
const { getMeetings, addMeeting, updateMeeting } = require('../controllers/meetingController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, getMeetings);
router.post('/', protect, authorize('admin', 'meeting_organizer', 'group_leader'), addMeeting);
router.put('/:id', protect, authorize('admin', 'meeting_organizer', 'group_leader'), updateMeeting);

module.exports = router;
