const Contribution = require('../models/Contribution');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const Settings = require('../models/Settings');
const bcrypt = require('bcryptjs');
const { createNotification } = require('./notificationController');

// ─── Week Utilities ────────────────────────────────────────────────────────

/**
 * Returns the Monday of the current week as a Date.
 */
function getWeekMonday(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sunday
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Returns the Sunday 23:49:59 deadline of the current week.
 * (System closes for 10 minutes to process weekly records)
 */
function getWeekDeadline(monday = getWeekMonday()) {
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6); // Mon+6 = Sun
  sunday.setHours(23, 49, 59, 999);
  return sunday;
}

/**
 * Returns a string weekId like "2026-W18" for the given date.
 */
function getWeekId(date = new Date()) {
  const monday = getWeekMonday(date);
  const year = monday.getFullYear();
  const startOfYear = new Date(year, 0, 1);
  const weekNum = Math.ceil(((monday - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7);
  return `${year}-W${String(weekNum).padStart(2, '0')}`;
}

/**
 * Checks if the current week is still open (deadline not passed).
 */
function isWeekOpen() {
  return new Date() <= getWeekDeadline();
}

// ─── Controllers ──────────────────────────────────────────────────────────

/**
 * @desc    Get all contributions
 * @route   GET /api/contributions
 * @access  Private
 */
const getContributions = async (req, res) => {
  const { week, user } = req.query;
  const query = {};

  // Members can only see their own contributions
  if (req.user.role === 'member' || req.user.role === 'official_member') {
    query.user = req.user._id;
  } else {
    if (week) query.weekId = week;
    if (user) query.user = user;
  }

  const contributions = await Contribution.find(query)
    .populate('user', 'name email role')
    .populate('markedPaidBy', 'name')
    .sort({ createdAt: -1 });

  res.json(contributions);
};

/**
 * @desc    Get current week status for all official members
 * @route   GET /api/contributions/weekly-status
 * @access  Private
 */
const getWeeklyStatus = async (req, res) => {
  const { week } = req.query;
  const weekId = week || getWeekId();
  const deadline = getWeekDeadline(week ? new Date(week.split('-')[0], 0, (parseInt(week.split('W')[1]) - 1) * 7 + 1) : undefined);
  const monday = getWeekMonday(week ? new Date(week.split('-')[0], 0, (parseInt(week.split('W')[1]) - 1) * 7 + 1) : undefined);
  const now = new Date();
  const weekOpen = now <= deadline;

  // Get all active/official members
  const officialRoles = [
    'group_leader', 'treasurer', 'welfare',
    'special_advicer', 'official_member',
  ];
  const members = await User.find({ role: { $in: officialRoles }, status: 'active' }).select('name email role');

  // Get contributions for this week
  const contributions = await Contribution.find({ weekId, type: 'weekly' })
    .populate('user', 'name email');

  // Build a map: userId → contribution
  const contribMap = {};
  for (const c of contributions) {
    if (c.user) contribMap[String(c.user._id)] = c;
  }

  // Load base amount from settings
  const settings = await Settings.findOne({});
  const baseAmount = settings?.weeklyContributionAmount || 100;

  const memberStatus = members.map(m => {
    const contrib = contribMap[String(m._id)];
    return {
      memberId: m._id,
      memberName: m.name,
      memberEmail: m.email,
      role: m.role,
      paid: contrib ? contrib.status === 'confirmed' : false,
      amount: contrib ? contrib.amount : 0,
      bonus: contrib ? contrib.bonus : 0,
      paymentChannel: contrib ? contrib.paymentChannel : null,
      contributionId: contrib ? contrib._id : null,
      paidAt: contrib ? contrib.updatedAt : null,
    };
  });

  res.json({
    weekId,
    weekOpen,
    deadline,
    weekStart: monday,
    baseAmount,
    memberStatus,
    totalPaid: memberStatus.filter(m => m.paid).length,
    totalMembers: memberStatus.length,
    totalCollected: memberStatus.reduce((sum, m) => sum + (m.paid ? m.amount : 0), 0),
  });
};

/**
 * @desc    Treasurer manually marks a member as paid for the current week
 * @route   POST /api/contributions/mark-paid
 * @access  Private/Treasurer/Admin
 */
const markPaid = async (req, res) => {
  const { memberId, weekId: requestedWeekId, amount, paymentChannel, note } = req.body;

  if (!memberId) {
    res.status(400);
    throw new Error('Member ID is required');
  }

  const weekId = requestedWeekId || getWeekId();
  const deadline = getWeekDeadline();

  // Load base amount from settings
  const settings = await Settings.findOne({});
  const baseAmount = settings?.weeklyContributionAmount || 100;
  const paidAmount = Number(amount) || baseAmount;
  const bonus = paidAmount > baseAmount ? paidAmount - baseAmount : 0;

  // Upsert: create or update contribution for this user+week
  const existing = await Contribution.findOne({ user: memberId, weekId, type: 'weekly' });

  let contribution;
  if (existing) {
    existing.status = 'confirmed';
    existing.amount = paidAmount;
    existing.bonus = bonus;
    existing.paymentChannel = paymentChannel || 'cash';
    existing.markedPaidBy = req.user._id;
    existing.note = note || existing.note;
    existing.deadline = deadline;
    contribution = await existing.save();
  } else {
    contribution = await Contribution.create({
      user: memberId,
      weekId,
      type: 'weekly',
      amount: paidAmount,
      baseAmount,
      bonus,
      paymentChannel: paymentChannel || 'cash',
      status: 'confirmed',
      markedPaidBy: req.user._id,
      note,
      deadline,
    });
  }

  // If paid via wallet, deduct from member's wallet balance
  if (paymentChannel === 'wallet') {
    const member = await User.findById(memberId);
    if (member) {
      if (member.walletBalance < paidAmount) {
        res.status(400);
        throw new Error('Member wallet balance is insufficient for this contribution');
      }
      member.walletBalance -= paidAmount;
      await member.save();

      await Transaction.create({
        user: memberId,
        type: 'debit',
        amount: paidAmount,
        note: `Weekly Contribution — ${weekId} (via wallet)`,
        relatedUser: req.user._id,
      });
    }
  }

  const populated = await Contribution.findById(contribution._id)
    .populate('user', 'name email')
    .populate('markedPaidBy', 'name');

  // Notify Member
  await createNotification({
    recipient: memberId,
    title: 'Contribution Confirmed',
    message: `Your contribution for ${weekId} of ₦${paidAmount.toLocaleString()} has been confirmed.`,
    type: 'success',
    link: '/contributions'
  });

  res.status(201).json(populated);
};

/**
 * @desc    Member pays weekly contribution via wallet (self-service)
 * @route   POST /api/contributions/pay-via-wallet
 * @access  Private (any member)
 */
const payViaWallet = async (req, res) => {
  const { pin } = req.body;
  if (!pin || pin.length !== 4) { res.status(400); throw new Error('Valid 4-digit transaction PIN is required'); }

  const userId = req.user._id;
  const weekId = getWeekId();
  const deadline = getWeekDeadline();

  if (new Date() > deadline) {
    res.status(400);
    throw new Error('This week\'s contribution window has closed (system locked for weekly reconciliation until Monday 00:00).');
  }

  const settings = await Settings.findOne({});
  const baseAmount = settings?.weeklyContributionAmount || 100;

  // Check for existing confirmed payment
  const existing = await Contribution.findOne({ user: userId, weekId, type: 'weekly', status: 'confirmed' });
  if (existing) {
    res.status(400);
    throw new Error('You have already paid your contribution for this week');
  }

  const member = await User.findById(userId).select('+transactionPin');
  if (!member) {
    res.status(404);
    throw new Error('User not found');
  }
  if (!member.transactionPin || !(await bcrypt.compare(pin, member.transactionPin))) {
    res.status(401); throw new Error('Invalid transaction PIN');
  }
  if (member.walletBalance < baseAmount) {
    res.status(400);
    throw new Error(`Insufficient wallet balance. You need ₦${baseAmount} but have ₦${member.walletBalance}`);
  }

  // Deduct from wallet
  member.walletBalance -= baseAmount;
  await member.save();

  // Record transaction
  await Transaction.create({
    user: userId,
    type: 'debit',
    amount: baseAmount,
    note: `Weekly Contribution — ${weekId} (wallet auto-pay)`,
    relatedUser: userId,
  });

  // Create/update contribution record
  const existingPending = await Contribution.findOne({ user: userId, weekId, type: 'weekly' });
  let contribution;
  if (existingPending) {
    existingPending.status = 'confirmed';
    existingPending.amount = baseAmount;
    existingPending.paymentChannel = 'wallet';
    existingPending.deadline = deadline;
    contribution = await existingPending.save();
  } else {
    contribution = await Contribution.create({
      user: userId,
      weekId,
      type: 'weekly',
      amount: baseAmount,
      baseAmount,
      bonus: 0,
      paymentChannel: 'wallet',
      status: 'confirmed',
      deadline,
    });
  }

  const populated = await Contribution.findById(contribution._id).populate('user', 'name email');
  res.status(201).json({ contribution: populated, newWalletBalance: member.walletBalance });
};

/**
 * @desc    Record a general (non-weekly) pool contribution
 * @route   POST /api/contributions/general
 * @access  Private (any member) — Treasurer can record on behalf
 */
const recordGeneralContribution = async (req, res) => {
  const { memberId, amount, paymentChannel, note, reference } = req.body;
  const targetUserId = memberId || req.user._id;

  if (!amount || Number(amount) <= 0) {
    res.status(400);
    throw new Error('Valid amount is required');
  }

  const contribution = await Contribution.create({
    user: targetUserId,
    type: 'general',
    isGeneralContribution: true,
    amount: Number(amount),
    baseAmount: Number(amount),
    bonus: 0,
    paymentChannel: paymentChannel || 'cash',
    status: 'confirmed',
    markedPaidBy: memberId ? req.user._id : undefined, // only set if recorded on behalf
    note,
    reference,
  });

  // If paid via wallet, deduct from member's balance
  if (paymentChannel === 'wallet') {
    const member = await User.findById(targetUserId);
    if (member) {
      if (member.walletBalance < Number(amount)) {
        // Rollback contribution creation
        await Contribution.findByIdAndDelete(contribution._id);
        res.status(400);
        throw new Error('Insufficient wallet balance for general contribution');
      }
      member.walletBalance -= Number(amount);
      await member.save();
      await Transaction.create({
        user: targetUserId,
        type: 'debit',
        amount: Number(amount),
        note: `General Pool Contribution (wallet)`,
        relatedUser: req.user._id,
      });
    }
  }

  const populated = await Contribution.findById(contribution._id).populate('user', 'name email');
  res.status(201).json(populated);
};

/**
 * @desc    Get unique week IDs
 * @route   GET /api/contributions/weeks
 * @access  Private
 */
const getWeeks = async (req, res) => {
  try {
    const weeks = await Contribution.distinct('weekId');
    res.json(weeks.filter(Boolean).sort().reverse());
  } catch (error) {
    res.status(500);
    throw new Error('Error fetching weeks');
  }
};

/**
 * @desc    Record batch contributions (legacy endpoint — kept for compatibility)
 * @route   POST /api/contributions/batch
 * @access  Private/Treasurer/Admin
 */
const recordBatchContributions = async (req, res) => {
  const { weekId, contributions } = req.body;

  if (!weekId || !contributions || !Array.isArray(contributions)) {
    res.status(400);
    throw new Error('Invalid batch data');
  }

  try {
    const deadline = getWeekDeadline();
    const settings = await Settings.findOne({});
    const baseAmount = settings?.weeklyContributionAmount || 100;

    const operations = contributions.map(c => ({
      updateOne: {
        filter: { user: c.memberId, weekId, type: 'weekly' },
        update: {
          $set: {
            amount: c.paid ? (c.amount || baseAmount) : 0,
            bonus: c.bonus || 0,
            note: c.note,
            status: c.paid ? 'confirmed' : 'pending',
            type: 'weekly',
            paymentChannel: c.paymentChannel || 'cash',
            markedPaidBy: req.user._id,
            deadline,
            baseAmount,
          }
        },
        upsert: true
      }
    }));

    await Contribution.bulkWrite(operations);
    res.json({ message: 'Ledger synchronized', weekId });
  } catch (error) {
    res.status(500);
    throw new Error('Batch synchronization failed');
  }
};

/**
 * @desc    Record historical contribution(s) manually
 * @route   POST /api/contributions/record-history
 * @access  Private/Treasurer/Admin
 */
const recordHistory = async (req, res) => {
  const { memberIds, amount, weekId, date, paymentChannel, note } = req.body;

  // Meticulous Validation
  if (!memberIds || !Array.isArray(memberIds) || memberIds.length === 0) {
    res.status(400);
    throw new Error('Selection of Institutional Subjects is required');
  }
  if (!weekId || !/^20\d{2}-W\d{2}$/.test(weekId)) {
    res.status(400);
    throw new Error('Invalid Temporal ID format (Expected: YYYY-WXX)');
  }
  if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
    res.status(400);
    throw new Error('Valid magnitude (amount) is required');
  }

  try {
    const settings = await Settings.findOne({});
    const baseAmount = settings?.weeklyContributionAmount || 100;
    const paidAmount = parseFloat(amount);
    const bonus = paidAmount > baseAmount ? paidAmount - baseAmount : 0;

    const results = await Promise.all(memberIds.map(async (memberId) => {
      // 1. Create/Update Contribution with meticulous state
      const contribution = await Contribution.findOneAndUpdate(
        { user: memberId, weekId, type: 'weekly' },
        {
          $set: {
            amount: paidAmount,
            bonus,
            status: 'confirmed',
            paymentChannel: paymentChannel || 'cash',
            markedPaidBy: req.user._id,
            paidAt: date ? new Date(date) : new Date(),
            note: note || 'Historical Ledger Backfill',
            baseAmount,
          }
        },
        { upsert: true, new: true }
      );

      // 2. Create Verifiable Audit Transaction
      await Transaction.create({
        user: memberId,
        type: 'contribution',
        amount: paidAmount,
        status: 'completed',
        description: `Institutional Record: Week ${weekId} Reconstruction`,
        reference: `HIST-${weekId}-${memberId.substring(19)}-${Date.now().toString().slice(-4)}`,
        metadata: { 
          weekId, 
          recordedBy: req.user._id, 
          channel: paymentChannel,
          originalNote: note 
        }
      });

      // 3. Dispatch System Notification
      try {
        await createNotification({
          user: memberId,
          title: 'Historical Ledger Update',
          message: `Administrative reconciliation for week ${weekId} has been finalized. Your status is now: CLEARED.`,
          type: 'payment',
          severity: 'success'
        });
      } catch (notiError) {
        console.error(`Notification failed for ${memberId}:`, notiError.message);
      }

      return { memberId, status: 'integrated' };
    }));

    res.json({ 
      success: true, 
      count: results.length, 
      message: `${results.length} historical records meticulously integrated into the strategic ledger.` 
    });
  } catch (error) {
    console.error('Meticulous History Record Error:', error);
    res.status(500);
    throw new Error('Historical ledger reconstruction failed. Internal system error.');
  }
};

module.exports = {
  getContributions,
  getWeeklyStatus,
  markPaid,
  payViaWallet,
  recordGeneralContribution,
  getWeeks,
  recordBatchContributions,
  recordHistory,
};
