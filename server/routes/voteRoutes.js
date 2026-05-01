const express = require('express');
const router = express.Router();
const { getVotes, createVote, castVote, closeVote } = require('../controllers/voteController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, getVotes);
router.post('/', protect, authorize('admin', 'group_leader'), createVote);
router.post('/:id/ballot', protect, castVote); // matches frontend api/votes.js castVote()
router.patch('/:id/close', protect, authorize('admin', 'group_leader'), closeVote);

module.exports = router;
