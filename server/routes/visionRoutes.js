const express = require('express');
const router = express.Router();
const { getVisions, createVision, upvoteVision } = require('../controllers/visionController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getVisions)
  .post(protect, createVision);

router.post('/:id/upvote', protect, upvoteVision);

module.exports = router;
