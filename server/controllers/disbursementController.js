const Disbursement = require('../models/Disbursement');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { createNotification } = require('./notificationController');
const AuditLog = require('../models/AuditLog');

function populateDisbursement(query) {
  return query
    .populate('memberId', 'name email walletBalance')
    .populate('requestedBy', 'name')
    .populate('reviewedBy', 'name');
}

function transformDisbursement(d) {
  if (!d) return null;
  const doc = d._doc || d;
  return { ...doc, member: d.memberId?.name || 'Unknown', id: doc._id };
}

/**
 * @desc    Get all disbursements
 * @route   GET /api/disbursements
 * @access  Private
 */
const getDisbursements = async (req, res) => {
  // Let all users see all disbursements for transparency
  const query = {};
  const disbursements = await populateDisbursement(Disbursement.find(query).sort({ createdAt: -1 }));
  res.json(disbursements.map(transformDisbursement));
};

/**
 * @desc    Group Leader creates a disbursement request
 * @route   POST /api/disbursements
 * @access  Private/GroupLeader/Admin
 */
const addDisbursement = async (req, res) => {
  const { memberId, amount, reason, type, method, bankAccountNumber, bankName, bankAccountName, password } = req.body;

  // 1. Authority Verification
  if (!password) {
    res.status(400);
    throw new Error('Institutional password is required to authorize disbursement requests');
  }

  const requester = await User.findById(req.user._id);
  const isMatch = await requester.matchPassword(password);
  if (!isMatch) {
    res.status(401);
    throw new Error('Authority verification failed. Incorrect institutional password.');
  }

  // 2. Data Validation
  if (!memberId) { res.status(400); throw new Error('Beneficiary identity required'); }
  if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) { 
    res.status(400); 
    throw new Error('Valid magnitude (amount) required'); 
  }
  if (!reason) { res.status(400); throw new Error('Distribution reasoning is required'); }

  const disbursement = await Disbursement.create({
    memberId,
    amount: parseFloat(amount),
    reason,
    type: type || 'general',
    method: method || 'wallet',
    bankAccountNumber: (method === 'bank_transfer') ? bankAccountNumber : undefined,
    bankName: (method === 'bank_transfer') ? bankName : undefined,
    bankAccountName: (method === 'bank_transfer') ? bankAccountName : undefined,
    requestedBy: req.user._id,
    status: 'pending',
  });

  const populated = await populateDisbursement(Disbursement.findById(disbursement._id));

  // Notify Treasurer and Admin
  await createNotification({
    role: 'treasurer',
    title: 'Disbursement Request',
    message: `A new disbursement request for ${amount.toLocaleString()} has been submitted for ${member || 'a member'}.`,
    type: 'warning',
    link: '/disbursements'
  });

  await AuditLog.create({
    user: req.user.name,
    action: 'DISBURSEMENT_REQUEST',
    detail: `Created disbursement request of ₦${parseFloat(amount).toLocaleString()} for ${populated.memberId?.name || 'member'}. Reason: ${reason}`,
    category: 'admin'
  });

  res.status(201).json(transformDisbursement(populated));
};

/**
 * @desc    Treasurer approves or declines a disbursement request
 * @route   PATCH /api/disbursements/:id/treasurer
 * @access  Private/Treasurer/Admin
 */
const treasurerAction = async (req, res) => {
  const { action, declineReason } = req.body;
  const disbursement = await Disbursement.findById(req.params.id);
  if (!disbursement) { res.status(404); throw new Error('Disbursement not found'); }
  if (disbursement.status !== 'pending') { res.status(400); throw new Error(`Can only act on pending disbursements. Status: ${disbursement.status}`); }

  if (action === 'decline') {
    disbursement.status = 'declined';
    disbursement.declineReason = declineReason || 'Declined by Treasurer';
    disbursement.reviewedBy = req.user._id;
    disbursement.reviewedAt = new Date();

    // Reverse withdrawal
    if (disbursement.type === 'withdrawal') {
      const member = await User.findById(disbursement.memberId);
      if (member) {
        member.walletBalance = (member.walletBalance || 0) + disbursement.amount;
        await member.save();
        
        await Transaction.create({
          user: member._id, type: 'credit', amount: disbursement.amount,
          note: `Withdrawal Declined: Refunded to wallet`,
          category: 'withdrawal',
          status: 'completed',
        });

        if (disbursement.sourceId) {
          const tx = await Transaction.findById(disbursement.sourceId);
          if (tx) {
            tx.status = 'declined';
            await tx.save();
          }
        }
      }
    }

    await disbursement.save();
    const populated = await populateDisbursement(Disbursement.findById(disbursement._id));
    return res.json(transformDisbursement(populated));
  }

  if (action !== 'approve') { res.status(400); throw new Error('action must be: approve | decline'); }

  disbursement.status = 'approved';
  disbursement.reviewedBy = req.user._id;
  disbursement.reviewedAt = new Date();

  // Auto-credit wallet if method is wallet
  if (disbursement.method === 'wallet' && disbursement.type !== 'withdrawal') {
    const member = await User.findById(disbursement.memberId);
    if (!member) { res.status(404); throw new Error('Beneficiary not found'); }
    member.walletBalance = (member.walletBalance || 0) + disbursement.amount;
    await member.save();
    disbursement.status = 'completed';
    disbursement.completedAt = new Date();
  }

  if (disbursement.type !== 'withdrawal') {
    await Transaction.create({
      user: disbursement.memberId, type: 'credit', amount: disbursement.amount,
      note: `Disbursement ${disbursement.method === 'wallet' ? '(wallet)' : `(${disbursement.method})`}: ${disbursement.reason}`,
      relatedUser: req.user._id,
    });
  } else {
    // It's a withdrawal, mark the pending transaction as completed
    if (disbursement.sourceId) {
      const tx = await Transaction.findById(disbursement.sourceId);
      if (tx) {
        tx.status = 'completed';
        await tx.save();
      }
    }
  }

  await disbursement.save();
  const populated = await populateDisbursement(Disbursement.findById(disbursement._id));

  // Notify Member
  if (action === 'approve') {
    await createNotification({
      recipient: disbursement.memberId,
      title: disbursement.type === 'withdrawal' ? 'Withdrawal Approved' : 'Disbursement Approved',
      message: disbursement.type === 'withdrawal' 
        ? `Your withdrawal of ₦${disbursement.amount.toLocaleString()} has been approved and processed.`
        : `Your disbursement of ₦${disbursement.amount.toLocaleString()} for "${disbursement.reason}" has been approved.`,
      type: 'success',
      link: disbursement.type === 'withdrawal' ? '/wallet' : '/disbursements'
    });
  } else {
    await createNotification({
      recipient: disbursement.memberId,
      title: disbursement.type === 'withdrawal' ? 'Withdrawal Declined' : 'Disbursement Declined',
      message: disbursement.type === 'withdrawal'
        ? `Your withdrawal request for ₦${disbursement.amount.toLocaleString()} was declined. Funds have been returned to your wallet. Reason: ${declineReason}`
        : `Your disbursement request for ₦${disbursement.amount.toLocaleString()} was declined. Reason: ${declineReason}`,
      type: 'urgent',
      link: disbursement.type === 'withdrawal' ? '/wallet' : '/disbursements'
    });
  }

  await AuditLog.create({
    user: req.user.name,
    action: `DISBURSEMENT_${action.toUpperCase()}`,
    detail: `${action === 'approve' ? 'Approved' : 'Declined'} ${disbursement.type || 'general'} disbursement of ₦${disbursement.amount.toLocaleString()} for ${populated.memberId?.name || 'member'}${declineReason ? '. Reason: ' + declineReason : ''}`,
    category: 'admin'
  });

  res.json(transformDisbursement(populated));
};

/**
 * @desc    Mark a disbursement as completed (for bank/cash after physical transfer)
 * @route   PATCH /api/disbursements/:id/complete
 * @access  Private/Treasurer/Admin
 */
const markCompleted = async (req, res) => {
  const disbursement = await Disbursement.findById(req.params.id);
  if (!disbursement) { res.status(404); throw new Error('Disbursement not found'); }
  if (disbursement.status !== 'approved') { res.status(400); throw new Error('Only approved disbursements can be marked completed'); }
  disbursement.status = 'completed';
  disbursement.completedAt = new Date();
  await disbursement.save();
  const populated = await populateDisbursement(Disbursement.findById(disbursement._id));
  res.json(transformDisbursement(populated));
};

/**
 * @desc    Legacy status update
 * @route   PATCH /api/disbursements/:id/status
 * @access  Private/Treasurer/Admin
 */
const updateDisbursementStatus = async (req, res) => {
  const { status } = req.body;
  const valid = ['pending','approved','declined','completed'];
  if (!valid.includes(status)) { res.status(400); throw new Error('Invalid status'); }
  const disbursement = await Disbursement.findById(req.params.id);
  if (!disbursement) { res.status(404); throw new Error('Disbursement not found'); }
  const oldStatus = disbursement.status;
  disbursement.status = status;
  disbursement.reviewedBy = req.user._id;
  disbursement.reviewedAt = new Date();
  if (status === 'completed') disbursement.completedAt = new Date();
  if (oldStatus !== 'approved' && status === 'approved') {
    await Transaction.create({
      user: disbursement.memberId, type: 'credit', amount: disbursement.amount,
      note: `Disbursement Approved: ${disbursement.reason}`, relatedUser: req.user._id,
    });
    if (disbursement.method === 'wallet') {
      const member = await User.findById(disbursement.memberId);
      if (member) { member.walletBalance = (member.walletBalance || 0) + disbursement.amount; await member.save(); }
    }
  }
  await disbursement.save();
  const populated = await populateDisbursement(Disbursement.findById(disbursement._id));
  res.json(transformDisbursement(populated));
};

module.exports = { getDisbursements, addDisbursement, treasurerAction, markCompleted, updateDisbursementStatus };
