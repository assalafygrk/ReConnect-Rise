const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { getArchives, uploadArchive, upvoteArchive, deleteArchive } = require('../controllers/archiveController');

router.route('/')
  .get(protect, getArchives)
  .post(protect, uploadArchive);

router.route('/:id')
  .delete(protect, deleteArchive);

router.patch('/:id/upvote', protect, upvoteArchive);

module.exports = router;
