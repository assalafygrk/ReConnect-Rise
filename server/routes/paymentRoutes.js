const express = require('express');
const router = express.Router();
const { generateVirtualAccount, paymentpointWebhook } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.post('/virtual-account', protect, generateVirtualAccount);
router.post('/webhook', paymentpointWebhook);

module.exports = router;
