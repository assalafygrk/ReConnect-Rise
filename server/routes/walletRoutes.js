const express = require('express');
const router = express.Router();
const { transferFunds, getWalletInfo } = require('../controllers/walletController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getWalletInfo);
router.post('/transfer', protect, transferFunds);

module.exports = router;
