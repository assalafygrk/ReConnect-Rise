const Loan = require('../models/Loan');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Settings = require('../models/Settings');
const Disbursement = require('../models/Disbursement');
const bcrypt = require('bcryptjs');

// ─── Helper ───────────────────────────────────────────────────────────────

async function getVaultBalance() {
  const settings = await Settings.findOne({});
  // Sum all confirmed contributions minus disbursed loans
  const Contribution = require('../models/Contribution');
  const totalContributions = await Contribution.aggregate([
    { $match: { status: 'confirmed' } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);
  const totalDisbursed = await Loan.aggregate([
    { $match: { status: { $in: ['active', 'disbursed_cash'] } } },
    { $group: { _id: null, total: { $sum: { $subtract: ['$amount', '$amountRepaid'] } } } }
  ]);
  const collected = totalContributions[0]?.total || 0;
  const outstanding = totalDisbursed[0]?.total || 0;
  return Math.max(0, collected - outstanding);
}

function populateLoan(query) {
  return query
    .populate('user', 'name email walletBalance')
    .populate('leaderApprovedBy', 'name')
    .populate('disbursedBy', 'name')
    .populate('approvedBy', 'name');
}

function transformLoan(loan) {
  if (!loan) return null;
  return {
    ...loan._doc || loan,
    member: loan.user?.name || 'Unknown',
    id: loan._id,
  };
}

// ─── Controllers ──────────────────────────────────────────────────────────

/**
 * @desc    Get all loans (role-filtered)
 * @route   GET /api/loans
 * @access  Private
 */
const getLoans = async (req, res) => {
  const { role } = req.user;
  const isPrivileged = ['super_admin', 'admin', 'groupleader', 'group_leader', 'treasurer'].includes(role);

  const query = isPrivileged ? {} : { user: req.user._id };

  const loans = await populateLoan(Loan.find(query).sort({ createdAt: -1 }));
  const vaultBalance = await getVaultBalance();

  res.json({ loans: loans.map(transformLoan), vaultBalance });
};

/**
 * @desc    Member requests a loan (first step)
 * @route   POST /api/loans
 * @access  Private (any member)
 */
const requestLoan = async (req, res) => {
  const { amount, purpose, duration, disbursementMethod } = req.body;

  if (!amount || !purpose || !duration) {
    res.status(400);
    throw new Error('Amount, purpose, and duration are required');
  }

  if (Number(amount) <= 0) {
    res.status(400);
    throw new Error('Loan amount must be positive');
  }

  // Check settings for max loan amount
  const settings = await Settings.findOne({});
  const maxLoan = settings?.maxLoanAmount;
  if (maxLoan && Number(amount) > maxLoan) {
    res.status(400);
    throw new Error(`Loan amount exceeds the maximum allowed: ₦${maxLoan.toLocaleString()}`);
  }

  // Check vault balance
  const vaultBalance = await getVaultBalance();
  if (Number(amount) > vaultBalance) {
    res.status(400);
    throw new Error(
      `Insufficient vault funds. Available: ₦${vaultBalance.toLocaleString()}. ` +
      `Your request of ₦${Number(amount).toLocaleString()} cannot be processed at this time.`
    );
  }

  const loan = await Loan.create({
    user: req.user._id,
    amount: Number(amount),
    purpose,
    duration: Number(duration),
    balance: Number(amount),
    disbursementMethod: disbursementMethod || 'wallet',
    interestRate: settings?.loanInterestRate || 0,
    status: 'pending',
  });

  const populated = await populateLoan(Loan.findById(loan._id));
  res.status(201).json(transformLoan(populated));
};

/**
 * @desc    Group Leader action on a loan (approve/negotiate/decline)
 * @route   PATCH /api/loans/:id/leader
 * @access  Private/GroupLeader/Admin
 */
const leaderAction = async (req, res) => {
  const { action, negotiationNotes, declineReason } = req.body;
  // action: 'approve' | 'negotiate' | 'decline'

  const loan = await Loan.findById(req.params.id);
  if (!loan) {
    res.status(404);
    throw new Error('Loan not found');
  }

  if (!['pending', 'negotiating'].includes(loan.status)) {
    res.status(400);
    throw new Error(`Cannot perform leader action on a loan with status: ${loan.status}`);
  }

  if (action === 'approve') {
    loan.status = 'leader_approved';
    loan.leaderApprovedBy = req.user._id;
    loan.leaderApprovedAt = new Date();
    if (negotiationNotes) loan.negotiationNotes = negotiationNotes;
  } else if (action === 'negotiate') {
    loan.status = 'negotiating';
    loan.negotiationNotes = negotiationNotes || loan.negotiationNotes;
  } else if (action === 'decline') {
    loan.status = 'declined';
    loan.declineReason = declineReason || 'Declined by Group Leader';
  } else {
    res.status(400);
    throw new Error('Invalid action. Must be: approve | negotiate | decline');
  }

  await loan.save();
  const populated = await populateLoan(Loan.findById(loan._id));
  res.json(transformLoan(populated));
};

/**
 * @desc    Member responds to negotiation
 * @route   PATCH /api/loans/:id/negotiate
 * @access  Private (loan owner)
 */
const memberNegotiate = async (req, res) => {
  const { negotiationNotes } = req.body;
  const loan = await Loan.findById(req.params.id);
  if (!loan) { res.status(404); throw new Error('Loan not found'); }
  if (String(loan.user) !== String(req.user._id)) { res.status(403); throw new Error('Not authorized'); }
  if (loan.status !== 'negotiating') { res.status(400); throw new Error('Loan is not in negotiation phase'); }

  loan.negotiationNotes = negotiationNotes;
  // Change status back to pending to return it to the leader queue
  loan.status = 'pending';
  await loan.save();

  const populated = await populateLoan(Loan.findById(loan._id));
  res.json(transformLoan(populated));
};

/**
 * @desc    Treasurer final action on a loan (disburse or decline)
 * @route   PATCH /api/loans/:id/treasurer
 * @access  Private/Treasurer/Admin
 */
const treasurerAction = async (req, res) => {
  const { action, declineReason } = req.body;
  // action: 'disburse' | 'decline'

  const loan = await Loan.findById(req.params.id);
  if (!loan) {
    res.status(404);
    throw new Error('Loan not found');
  }

  if (loan.status !== 'leader_approved') {
    res.status(400);
    throw new Error(`Loan must be at leader_approved stage. Current status: ${loan.status}`);
  }

  if (action === 'decline') {
    loan.status = 'declined';
    loan.declineReason = declineReason || 'Declined by Treasurer';
    await loan.save();
    const populated = await populateLoan(Loan.findById(loan._id));
    return res.json(transformLoan(populated));
  }

  if (action !== 'disburse') {
    res.status(400);
    throw new Error('Invalid action. Must be: disburse | decline');
  }

  // Re-check vault balance before disbursing
  const vaultBalance = await getVaultBalance();
  if (loan.amount > vaultBalance) {
    res.status(400);
    throw new Error(
      `Vault balance insufficient at disbursement time. ` +
      `Available: ₦${vaultBalance.toLocaleString()}, Required: ₦${loan.amount.toLocaleString()}`
    );
  }

  loan.disbursedBy = req.user._id;
  loan.disbursedAt = new Date();
  loan.repaymentDate = new Date(Date.now() + loan.duration * 30 * 24 * 60 * 60 * 1000);
  loan.approvedBy = req.user._id;

  if (loan.disbursementMethod === 'wallet') {
    // Auto-credit member's wallet
    const member = await User.findById(loan.user);
    if (!member) {
      res.status(404);
      throw new Error('Loan beneficiary not found');
    }
    member.walletBalance = (member.walletBalance || 0) + loan.amount;
    await member.save();

    loan.status = 'active';

    // Record disbursement transaction
    await Transaction.create({
      user: loan.user,
      type: 'credit',
      amount: loan.amount,
      note: `Loan Disbursed to Wallet: ${loan.purpose}`,
      relatedUser: req.user._id,
    });
  } else {
    // Cash disbursement — mark as disbursed, physical handover needed
    loan.status = 'disbursed_cash';
    await Transaction.create({
      user: loan.user,
      type: 'credit',
      amount: loan.amount,
      note: `Loan Disbursed (Cash): ${loan.purpose}`,
      relatedUser: req.user._id,
    });
  }

  await loan.save();
  const populated = await populateLoan(Loan.findById(loan._id));
  res.json(transformLoan(populated));
};

/**
 * @desc    Record loan repayment (Treasurer/Admin)
 * @route   POST /api/loans/:id/repay
 * @access  Private/Treasurer/Admin
 */
const recordRepayment = async (req, res) => {
  const { amount, paymentChannel } = req.body;
  const loan = await Loan.findById(req.params.id);

  if (!loan) {
    res.status(404);
    throw new Error('Loan not found');
  }

  if (!['active', 'disbursed_cash'].includes(loan.status)) {
    res.status(400);
    throw new Error(`Cannot record repayment on loan with status: ${loan.status}`);
  }

  if (Number(amount) <= 0) {
    res.status(400);
    throw new Error('Repayment amount must be positive');
  }

  loan.amountRepaid = (loan.amountRepaid || 0) + Number(amount);
  loan.balance = Math.max(0, loan.balance - Number(amount));

  if (loan.balance <= 0) {
    loan.status = 'repaid';
    loan.balance = 0;
  }

  // If repaid via wallet, deduct from member wallet
  if (paymentChannel === 'wallet') {
    const member = await User.findById(loan.user);
    if (member) {
      if (member.walletBalance < Number(amount)) {
        res.status(400);
        throw new Error('Member wallet balance insufficient for repayment');
      }
      member.walletBalance -= Number(amount);
      await member.save();
    }
  }

  await Transaction.create({
    user: loan.user,
    type: 'debit',
    amount: Number(amount),
    note: `Loan Repayment${paymentChannel === 'wallet' ? ' (wallet)' : ' (cash)'}: ${loan.purpose}`,
    relatedUser: req.user._id,
  });

  await loan.save();
  const populated = await populateLoan(Loan.findById(loan._id));
  res.json(transformLoan(populated));
};

/**
 * @desc    Legacy status update (kept for backward compat)
 * @route   PUT /api/loans/:id/status
 * @access  Private/Admin
 */
const updateLoanStatus = async (req, res) => {
  const loan = await Loan.findById(req.params.id);
  if (!loan) {
    res.status(404);
    throw new Error('Loan not found');
  }
  loan.status = req.body.status || loan.status;
  await loan.save();
  const populated = await populateLoan(Loan.findById(loan._id));
  res.json(transformLoan(populated));
};

/**
 * @desc    Member repays loan via wallet
 * @route   POST /api/loans/:id/repay-wallet
 * @access  Private (loan owner)
 */
const memberRepayWallet = async (req, res) => {
  const { amount, pin } = req.body;
  if (!pin || pin.length !== 4) { res.status(400); throw new Error('Valid 4-digit transaction PIN is required'); }

  const loan = await Loan.findById(req.params.id);

  if (!loan) { res.status(404); throw new Error('Loan not found'); }
  if (String(loan.user) !== String(req.user._id)) { res.status(403); throw new Error('Not authorized'); }
  if (!['active', 'disbursed_cash'].includes(loan.status)) { res.status(400); throw new Error(`Cannot record repayment on loan with status: ${loan.status}`); }
  if (Number(amount) <= 0) { res.status(400); throw new Error('Repayment amount must be positive'); }
  if (Number(amount) > loan.balance) { res.status(400); throw new Error('Repayment amount cannot exceed loan balance'); }

  const member = await User.findById(req.user._id).select('+transactionPin');
  if (!member.transactionPin || !(await bcrypt.compare(pin, member.transactionPin))) {
    res.status(401); throw new Error('Invalid transaction PIN');
  }
  if (member.walletBalance < Number(amount)) { res.status(400); throw new Error('Insufficient wallet balance for repayment'); }

  member.walletBalance -= Number(amount);
  await member.save();

  loan.amountRepaid = (loan.amountRepaid || 0) + Number(amount);
  loan.balance = Math.max(0, loan.balance - Number(amount));

  if (loan.balance <= 0) {
    loan.status = 'repaid';
    loan.balance = 0;
  }
  await loan.save();

  await Transaction.create({
    user: loan.user,
    type: 'debit',
    amount: Number(amount),
    note: `Loan Repayment via Wallet`,
    relatedUser: loan.user,
  });

  const populated = await populateLoan(Loan.findById(loan._id));
  res.json(transformLoan(populated));
};

module.exports = {
  getLoans,
  requestLoan,
  leaderAction,
  memberNegotiate,
  treasurerAction,
  recordRepayment,
  memberRepayWallet,
  updateLoanStatus,
};
