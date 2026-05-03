const express = require('express');
const router = express.Router();
const { transferFunds, getWalletInfo, depositFunds, withdrawFunds, payWeeklyContribution, payGeneralContribution } = require('../controllers/walletController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getWalletInfo);
router.post('/transfer', protect, transferFunds);
router.post('/deposit', protect, depositFunds);
router.post('/withdraw', protect, withdrawFunds);
router.post('/contribute/weekly', protect, payWeeklyContribution);
router.post('/contribute/general', protect, payGeneralContribution);

module.exports = router;
