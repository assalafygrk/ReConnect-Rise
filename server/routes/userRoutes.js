const express = require('express');
const router = express.Router();
const {
  authUser,
  verifyLogin2FA,
  registerUser,
  getUserProfile,
  updateUserProfile,
  updatePassword,
  setTransactionPin,
  changeTransactionPin,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', registerUser);
router.post('/login', authUser);
router.post('/login/2fa', verifyLogin2FA);
router.route('/profile').get(protect, getUserProfile).put(protect, updateUserProfile);
router.patch('/profile/password', protect, updatePassword);
router.patch('/profile/pin', protect, setTransactionPin);
router.patch('/profile/pin/change', protect, changeTransactionPin);

module.exports = router;
