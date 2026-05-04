const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Contribution = require('../models/Contribution');
const Settings = require('../models/Settings');
const bcrypt = require('bcryptjs');

// ─── System Pool ──────────────────────────────────────────────────────────
// The treasury pool is tracked via a special system user or just via
// Transaction records with user = 'POOL'. We use a virtual pool balance
// calculated from all confirmed contributions minus disbursements.

/**
 * @desc  Get wallet info + full transaction history
 * @route GET /api/wallet
 */
const getWalletInfo = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) { res.status(404); throw new Error('User not found'); }

  const transactions = await Transaction.find({ user: user._id })
    .sort({ createdAt: -1 })
    .populate('relatedUser', 'name email');

  const totalGiftsSent     = transactions.filter(t => t.type === 'debit').reduce((a, t) => a + t.amount, 0);
  const totalGiftsReceived = transactions.filter(t => t.type === 'credit').reduce((a, t) => a + t.amount, 0);

  res.json({
    balance: user.walletBalance || 0,
    recentTransactions: transactions,   // full history, not limited to 10
    totalGiftsSent,
    totalGiftsReceived,
  });
};

/**
 * @desc  Transfer / gift funds to another member (by id or email)
 * @route POST /api/wallet/transfer
 */
const transferFunds = async (req, res) => {
  const { to, amount, note, pin } = req.body;
  if (!to || !amount || Number(amount) <= 0) { res.status(400); throw new Error('Recipient and a positive amount are required'); }
  if (!pin || pin.length !== 4) { res.status(400); throw new Error('Valid 4-digit transaction PIN is required'); }

  const fromUser = await User.findById(req.user._id).select('+transactionPin');
  if (!fromUser.transactionPin || !(await bcrypt.compare(pin, fromUser.transactionPin))) {
    res.status(401); throw new Error('Invalid transaction PIN');
  }

  // Accept recipient by id or email
  const toUser = await User.findById(to).catch(() => null) || await User.findOne({ email: to });
  if (!toUser) { res.status(404); throw new Error('Recipient not found'); }
  if (String(fromUser._id) === String(toUser._id)) { res.status(400); throw new Error('Cannot transfer to yourself'); }
  if ((fromUser.walletBalance || 0) < Number(amount)) { res.status(400); throw new Error('Insufficient wallet balance'); }

  fromUser.walletBalance -= Number(amount);
  toUser.walletBalance    = (toUser.walletBalance || 0) + Number(amount);
  await fromUser.save();
  await toUser.save();

  await Transaction.create({ user: fromUser._id, type: 'debit',  amount: Number(amount), note: note || `Gift to ${toUser.name}`,   relatedUser: toUser._id });
  await Transaction.create({ user: toUser._id,   type: 'credit', amount: Number(amount), note: note || `Gift from ${fromUser.name}`, relatedUser: fromUser._id });

  res.json({ success: true, message: 'Transfer successful', newBalance: fromUser.walletBalance });
};

/**
 * @desc  Member deposits funds into their own wallet (treasurer records on behalf)
 * @route POST /api/wallet/deposit
 */
const depositFunds = async (req, res) => {
  const { amount, note, userId } = req.body;
  if (!amount || Number(amount) <= 0) { res.status(400); throw new Error('Valid amount required'); }

  // Treasurer can deposit on behalf of another user; members deposit to themselves
  const targetId   = userId || req.user._id;
  const targetUser = await User.findById(targetId);
  if (!targetUser) { res.status(404); throw new Error('User not found'); }

  targetUser.walletBalance = (targetUser.walletBalance || 0) + Number(amount);
  await targetUser.save();

  await Transaction.create({
    user: targetUser._id, type: 'credit', amount: Number(amount),
    note: note || 'Wallet Top-up / Deposit',
    relatedUser: req.user._id,
  });

  res.json({ success: true, newBalance: targetUser.walletBalance });
};

/**
 * @desc  Withdraw from wallet (requires treasurer approval for large amounts)
 * @route POST /api/wallet/withdraw
 */
const withdrawFunds = async (req, res) => {
  const { amount, note, bankName, accountNumber, pin } = req.body;
  if (!amount || Number(amount) <= 0) { res.status(400); throw new Error('Valid amount required'); }
  if (!bankName || !accountNumber) { res.status(400); throw new Error('Bank details are required for withdrawal'); }
  if (!pin || pin.length !== 4) { res.status(400); throw new Error('Valid 4-digit transaction PIN is required'); }

  const user = await User.findById(req.user._id).select('+transactionPin');
  if (!user.transactionPin || !(await bcrypt.compare(pin, user.transactionPin))) {
    res.status(401); throw new Error('Invalid transaction PIN');
  }
  if ((user.walletBalance || 0) < Number(amount)) { res.status(400); throw new Error('Insufficient wallet balance'); }

  user.walletBalance -= Number(amount);
  await user.save();

  await Transaction.create({
    user: user._id, type: 'debit', amount: Number(amount),
    note: note || `Withdrawal to ${bankName} (${accountNumber})`,
  });

  res.json({ success: true, newBalance: user.walletBalance });
};

/**
 * @desc  Pay weekly contribution from wallet (self-service shortcut)
 * @route POST /api/wallet/contribute/weekly
 */
const payWeeklyContribution = async (req, res) => {
  // Delegate to contribution controller logic
  const contributionController = require('./contributionController');
  return contributionController.payViaWallet(req, res);
};

/**
 * @desc  Make a general pool contribution from wallet
 * @route POST /api/wallet/contribute/general
 */
const payGeneralContribution = async (req, res) => {
  const { amount, note, pin } = req.body;
  if (!amount || Number(amount) <= 0) { res.status(400); throw new Error('Valid amount required'); }
  if (!pin || pin.length !== 4) { res.status(400); throw new Error('Valid 4-digit transaction PIN is required'); }

  const user = await User.findById(req.user._id).select('+transactionPin');
  if (!user) { res.status(404); throw new Error('User not found'); }
  if (!user.transactionPin || !(await bcrypt.compare(pin, user.transactionPin))) {
    res.status(401); throw new Error('Invalid transaction PIN');
  }
  if ((user.walletBalance || 0) < Number(amount)) { res.status(400); throw new Error('Insufficient wallet balance'); }

  user.walletBalance -= Number(amount);
  await user.save();

  // Credit the system treasury pool — track as a contribution record
  await Contribution.create({
    user: user._id, type: 'general', isGeneralContribution: true,
    amount: Number(amount), baseAmount: Number(amount), bonus: 0,
    paymentChannel: 'wallet', status: 'confirmed',
    note: note || 'General pool contribution via wallet',
  });

  // Debit transaction on member's ledger
  await Transaction.create({
    user: user._id, type: 'debit', amount: Number(amount),
    note: note || 'General Pool Contribution (wallet)',
  });

  // Track pool credit separately with a system marker
  await Transaction.create({
    user: user._id, type: 'credit', amount: 0, // zero amount — just a pool receipt marker
    note: `Pool Receipt: ₦${Number(amount).toLocaleString()} from ${user.name}`,
    relatedUser: user._id,
  });

  res.json({ success: true, newBalance: user.walletBalance });
};

module.exports = { getWalletInfo, transferFunds, depositFunds, withdrawFunds, payWeeklyContribution, payGeneralContribution };
