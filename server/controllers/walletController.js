const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Contribution = require('../models/Contribution');
const Settings = require('../models/Settings');
const bcrypt = require('bcryptjs');
const AuditLog = require('../models/AuditLog');

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

  const settings = await Settings.findOne({});
  const weeklyContributionAmount = settings?.weeklyContributionAmount || 100;

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const dailyWithdrawalsCount = await Transaction.countDocuments({
    user: user._id,
    category: 'withdrawal',
    createdAt: { $gte: startOfDay, $lte: endOfDay }
  });

  res.json({
    balance: user.walletBalance || 0,
    weeklyContributionAmount,
    recentTransactions: transactions,   // full history, not limited to 10
    totalGiftsSent,
    totalGiftsReceived,
    dailyWithdrawalsCount,
    virtualAccount: user.paymentPointVirtualAccount ? {
      accountNumber: user.paymentPointVirtualAccount,
      bankName: user.paymentPointBankName,
      accountName: user.paymentPointAccountName
    } : null,
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

  await Transaction.create({ user: fromUser._id, type: 'debit',  amount: Number(amount), note: note || `Gift to ${toUser.name}`,   relatedUser: toUser._id, category: 'gift' });
  await Transaction.create({ user: toUser._id,   type: 'credit', amount: Number(amount), note: note || `Gift from ${fromUser.name}`, relatedUser: fromUser._id, category: 'gift' });

  await AuditLog.create({
    user: fromUser.name,
    action: 'WALLET_TRANSFER',
    detail: `Transferred ₦${Number(amount).toLocaleString()} to ${toUser.name} (${toUser.email})`,
    category: 'system'
  });

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
    category: 'deposit',
  });

  await AuditLog.create({
    user: req.user.name,
    action: 'WALLET_DEPOSIT',
    detail: `Deposited ₦${Number(amount).toLocaleString()} into ${targetUser.name}'s wallet`,
    category: 'admin'
  });

  res.json({ success: true, newBalance: targetUser.walletBalance });
};

/**
 * @desc  Withdraw from wallet (requires treasurer approval for large amounts)
 * @route POST /api/wallet/withdraw
 */
const withdrawFunds = async (req, res) => {
  const { amount, note, bankName, accountNumber, bankAccountName, pin } = req.body;
  if (!amount || Number(amount) <= 0) { res.status(400); throw new Error('Valid amount required'); }
  if (!bankName || !accountNumber) { res.status(400); throw new Error('Bank details are required for withdrawal'); }
  if (!pin || pin.length !== 4) { res.status(400); throw new Error('Valid 4-digit transaction PIN is required'); }

  const user = await User.findById(req.user._id).select('+transactionPin');
  if (!user.transactionPin || !(await bcrypt.compare(pin, user.transactionPin))) {
    res.status(401); throw new Error('Invalid transaction PIN');
  }

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  // Check for previous withdrawals today
  const dailyWithdrawals = await Transaction.countDocuments({
    user: user._id,
    category: 'withdrawal',
    createdAt: { $gte: startOfDay, $lte: endOfDay }
  });

  let fee = 0;
  if (dailyWithdrawals >= 3) {
    const rawFee = Number(amount) * 0.01;
    fee = rawFee > 50 ? 50 : rawFee;
  }

  const totalDeduction = Number(amount) + fee;

  if ((user.walletBalance || 0) < totalDeduction) {
    res.status(400);
    throw new Error(`Insufficient wallet balance. Total deduction (including ₦${fee} fee) is ₦${totalDeduction}`);
  }

  // Deduct immediately but hold in pending state
  user.walletBalance -= totalDeduction;
  await user.save();

  // Create Disbursement request for Treasurer
  const Disbursement = require('../models/Disbursement');
  const disbursement = await Disbursement.create({
    memberId: user._id,
    amount: Number(amount),
    type: 'withdrawal',
    reason: note || `Wallet Withdrawal to ${bankName} (${accountNumber})`,
    method: 'bank_transfer',
    bankName,
    bankAccountNumber: accountNumber,
    bankAccountName,
    status: 'pending',
  });

  // Create pending transaction to reflect on user ledger
  const tx = await Transaction.create({
    user: user._id, type: 'debit', amount: Number(amount),
    note: note || `Withdrawal to ${bankName} (${accountNumber})`,
    category: 'withdrawal',
    status: 'pending',
  });

  // Link disbursement and transaction via sourceId if needed
  disbursement.sourceId = tx._id;
  await disbursement.save();

  if (fee > 0) {
    await Transaction.create({
      user: user._id, type: 'debit', amount: fee,
      note: `Withdrawal Fee (Subsequent withdrawal today)`,
      category: 'other',
      status: 'pending',
    });
  }

  // Notify Treasurers via Email
  try {
    const treasurers = await User.find({ role: 'treasurer' });
    if (treasurers.length > 0) {
      const sendEmail = require('../utils/sendEmail');
      for (const treasurer of treasurers) {
        await sendEmail({
          email: treasurer.email,
          subject: 'Action Required: New Withdrawal Request',
          message: `Dear Treasurer,\n\nA new withdrawal request of ₦${Number(amount).toLocaleString('en-NG')} has been requested by ${user.name}.\n\nBank: ${bankName}\nAccount Number: ${accountNumber}\nAccount Name: ${bankAccountName || 'N/A'}\n\nPlease review and approve or decline this request on the ReConnect & Rise admin portal.`,
          html: `
            <div style="font-family: sans-serif; padding: 20px;">
              <h2>New Withdrawal Request</h2>
              <p>Dear Treasurer,</p>
              <p>A new withdrawal request has been submitted and requires your attention.</p>
              <ul>
                <li><strong>Member:</strong> ${user.name}</li>
                <li><strong>Amount:</strong> ₦${Number(amount).toLocaleString('en-NG')}</li>
                <li><strong>Bank:</strong> ${bankName}</li>
                <li><strong>Account Number:</strong> ${accountNumber}</li>
                <li><strong>Account Name:</strong> ${bankAccountName || 'N/A'}</li>
              </ul>
              <p>Please log in to the ReConnect & Rise portal to review and process this transaction.</p>
            </div>
          `
        });
      }
    }
  } catch (emailErr) {
    console.error('Failed to send treasurer withdrawal email:', emailErr);
  }

  await AuditLog.create({
    user: user.name,
    action: 'WALLET_WITHDRAWAL_REQUEST',
    detail: `Withdrawal request of ₦${Number(amount).toLocaleString()} to ${bankName} (${accountNumber}). Fee: ₦${fee}`,
    category: 'system'
  });

  res.json({ success: true, newBalance: user.walletBalance, feeApplied: fee, status: 'pending' });
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
    category: 'contribution',
  });

  // Track pool credit separately with a system marker
  await Transaction.create({
    user: user._id, type: 'credit', amount: 0, // zero amount — just a pool receipt marker
    note: `Pool Receipt: ₦${Number(amount).toLocaleString()} from ${user.name}`,
    relatedUser: user._id,
  });

  await AuditLog.create({
    user: user.name,
    action: 'GENERAL_CONTRIBUTION',
    detail: `General pool contribution of ₦${Number(amount).toLocaleString()} via wallet`,
    category: 'system'
  });

  res.json({ success: true, newBalance: user.walletBalance });
};

module.exports = { getWalletInfo, transferFunds, depositFunds, withdrawFunds, payWeeklyContribution, payGeneralContribution };
