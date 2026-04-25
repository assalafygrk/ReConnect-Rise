const User = require('../models/User');
const Transaction = require('../models/Transaction');

// @desc    Get wallet info and recent transactions
// @route   GET /api/wallet
// @access  Private
const getWalletInfo = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    const recentTransactions = await Transaction.find({ user: user._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('relatedUser', 'name email');

    res.json({
      balance: user.walletBalance || 0,
      recentTransactions,
    });
  } catch (error) {
    res.status(500);
    throw new Error('Failed to fetch wallet info');
  }
};

const transferFunds = async (req, res) => {
  const { to, amount, note } = req.body;
  const fromUser = await User.findById(req.user._id);
  const toUser = await User.findOne({ email: to }); // Assuming 'to' is email

  if (!toUser) {
    res.status(404);
    throw new Error('Recipient not found');
  }

  if (fromUser.walletBalance < amount) {
    res.status(400);
    throw new Error('Insufficient balance');
  }

  fromUser.walletBalance -= Number(amount);
  toUser.walletBalance += Number(amount);

  await fromUser.save();
  await toUser.save();

  // Create transactions
  await Transaction.create({
    user: fromUser._id,
    type: 'debit',
    amount: Number(amount),
    note: note || 'Wallet transfer',
    relatedUser: toUser._id,
  });

  await Transaction.create({
    user: toUser._id,
    type: 'credit',
    amount: Number(amount),
    note: note || 'Wallet transfer',
    relatedUser: fromUser._id,
  });

  res.json({ success: true, message: 'Transfer successful', newBalance: fromUser.walletBalance });
};

module.exports = { transferFunds, getWalletInfo };
