const express = require('express');
const router = express.Router();
const { getArchives, uploadArchive } = require('../controllers/archiveController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getArchives)
  .post(protect, uploadArchive);

module.exports = router;
