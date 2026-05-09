const User = require('../models/User');
const Contribution = require('../models/Contribution');
const Loan = require('../models/Loan');
const Transaction = require('../models/Transaction');
const Settings = require('../models/Settings');
const Disbursement = require('../models/Disbursement');
const Vision = require('../models/Vision');
const Meeting = require('../models/Meeting');
const AuditLog = require('../models/AuditLog');
const Request = require('../models/Request');
const { syncOverdueLoans } = require('../utils/loanSync');

// @desc    Get dashboard summary — provides rich, role-aware data
// @route   GET /api/dashboard
// @access  Private
const getDashboardSummary = async (req, res) => {
  try {
    // Run automated overdue loan sync/deduction
    await syncOverdueLoans();

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const startOfMonth = new Date(currentYear, currentMonth, 1);
    const startOfYear = new Date(`${currentYear}-01-01`);
    const endOfYear = new Date(`${currentYear}-12-31T23:59:59.999Z`);

    // ═══════════════════════════════════════════════════════════════════════
    // CORE FINANCIAL DATA (used by ALL roles for Treasury Toll transparency)
    // ═══════════════════════════════════════════════════════════════════════

    const memberCount = await User.countDocuments({});
    const activeMembers = await User.countDocuments({ status: 'active' });
    const pendingMembers = await User.countDocuments({ status: 'pending' });
    const suspendedMembers = await User.countDocuments({ status: 'suspended' });

    // All confirmed contributions (total inflow)
    const contributions = await Contribution.find({ status: 'confirmed' });
    const totalInflow = contributions.reduce((acc, c) => acc + c.amount, 0);

    // Contributions this month
    const monthlyContributions = await Contribution.find({
      status: 'confirmed',
      createdAt: { $gte: startOfMonth }
    });
    const monthlyInflowTotal = monthlyContributions.reduce((acc, c) => acc + c.amount, 0);

    // All disbursed loans (outflow)
    const disbursedLoansData = await Loan.find({
      status: { $in: ['disbursed', 'active', 'repaid', 'disbursed_cash'] }
    });
    const totalLoansOutflow = disbursedLoansData.reduce((acc, l) => acc + l.amount, 0);
    const totalRepaymentsIn = disbursedLoansData.reduce((acc, l) => acc + (l.amountRepaid || 0), 0);

    // All disbursements (outflow)
    const disbursementsData = await Disbursement.find({
      status: { $in: ['approved', 'completed'] }
    });
    const totalDisbursementsOutflow = disbursementsData.reduce((acc, d) => acc + d.amount, 0);

    // Pool balance = inflows - loans out + repayments - disbursements
    const poolBalance = totalInflow - totalLoansOutflow + totalRepaymentsIn - totalDisbursementsOutflow;

    // Settings
    let settings = await Settings.findOne();
    if (!settings) settings = await Settings.create({});
    const savingsGoal = settings.welfareTarget + settings.loanFundTarget;

    // Active loans
    const activeLoans = await Loan.find({ status: { $in: ['active', 'disbursed', 'disbursed_cash'] } });
    const totalActiveLoansAmount = activeLoans.reduce((acc, l) => acc + l.amount, 0);

    // Pending loans
    const pendingLoans = await Loan.find({ status: { $in: ['pending', 'negotiating', 'leader_approved'] } });

    // Collection stats (this month)
    const uniquePayersThisMonth = await Contribution.distinct('user', {
      status: 'confirmed',
      createdAt: { $gte: startOfMonth }
    });
    const totalPaid = uniquePayersThisMonth.length;
    const totalUnpaid = memberCount - totalPaid;

    // ═══════════════════════════════════════════════════════════════════════
    // RECENT TRANSACTIONS
    // ═══════════════════════════════════════════════════════════════════════
    const recentTxData = await Transaction.find({})
      .sort({ createdAt: -1 })
      .limit(15)
      .populate('user', 'name facialUpload');

    const recentTransactions = recentTxData.map(tx => ({
      id: tx._id,
      member: tx.user?.name || 'System',
      avatar: tx.user?.facialUpload || null,
      type: tx.type === 'credit' ? 'contribution' : 'payout',
      note: tx.note || (tx.type === 'credit' ? 'Inward Transfer' : 'Outward Transfer'),
      amount: tx.amount,
      date: tx.date,
      category: tx.category || 'other',
      status: tx.status || 'completed'
    }));

    // ═══════════════════════════════════════════════════════════════════════
    // MONTHLY CHART DATA (12 months)
    // ═══════════════════════════════════════════════════════════════════════
    const influxData = await Contribution.aggregate([
      { $match: { status: 'confirmed', createdAt: { $gte: startOfYear, $lte: endOfYear } } },
      { $group: { _id: { month: { $month: "$createdAt" } }, total: { $sum: "$amount" }, count: { $sum: 1 } } }
    ]);

    const outflowData = await Disbursement.aggregate([
      { $match: { status: { $in: ['approved', 'completed'] }, createdAt: { $gte: startOfYear, $lte: endOfYear } } },
      { $group: { _id: { month: { $month: "$createdAt" } }, total: { $sum: "$amount" }, count: { $sum: 1 } } }
    ]);

    const loanOutflowData = await Loan.aggregate([
      { $match: { status: { $in: ['active', 'disbursed', 'disbursed_cash', 'repaid'] }, createdAt: { $gte: startOfYear, $lte: endOfYear } } },
      { $group: { _id: { month: { $month: "$createdAt" } }, total: { $sum: "$amount" }, count: { $sum: 1 } } }
    ]);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyChart = months.map((month, index) => {
      const inMonth = influxData.find(d => d._id.month === index + 1);
      const outMonth = outflowData.find(d => d._id.month === index + 1);
      const loanMonth = loanOutflowData.find(d => d._id.month === index + 1);
      return {
        month,
        contributions: inMonth ? inMonth.total : 0,
        contributionCount: inMonth ? inMonth.count : 0,
        disbursements: (outMonth ? outMonth.total : 0) + (loanMonth ? loanMonth.total : 0),
        disbursementCount: (outMonth ? outMonth.count : 0) + (loanMonth ? loanMonth.count : 0),
      };
    });

    // ═══════════════════════════════════════════════════════════════════════
    // MY STATS (current user)
    // ═══════════════════════════════════════════════════════════════════════
    const userContributions = await Contribution.find({ user: req.user._id, status: 'confirmed' });
    const myTotalContributions = userContributions.reduce((acc, c) => acc + c.amount, 0);
    const myActiveLoan = await Loan.findOne({ user: req.user._id, status: { $in: ['active', 'disbursed', 'disbursed_cash'] } });
    const myPendingLoan = await Loan.findOne({ user: req.user._id, status: { $in: ['pending', 'negotiating', 'leader_approved'] } });
    const myContributionThisMonth = await Contribution.findOne({
      user: req.user._id,
      status: 'confirmed',
      createdAt: { $gte: startOfMonth }
    });

    // User seniority
    const user = await User.findById(req.user._id);
    const joinDate = user.createdAt;
    const seniorityDays = Math.floor((now - joinDate) / (1000 * 60 * 60 * 24));
    const seniorityYears = Math.floor(seniorityDays / 365);
    const trustScore = Math.min(100, 70 + (seniorityDays > 30 ? 10 : 0) + (myTotalContributions > 0 ? 10 : 0) + (seniorityYears * 3));

    // ═══════════════════════════════════════════════════════════════════════
    // WELFARE & REQUEST STATS
    // ═══════════════════════════════════════════════════════════════════════
    const pendingRequests = await Request.countDocuments({ status: 'pending' });
    const welfareApprovedRequests = await Request.countDocuments({ status: 'welfare_approved' });
    const leaderApprovedRequests = await Request.countDocuments({ status: 'leader_approved' });
    const totalApprovedRequests = await Request.countDocuments({ status: 'approved' });
    const totalDeclinedRequests = await Request.countDocuments({ status: 'declined' });
    const welfareDisbursements = await Disbursement.find({ type: 'welfare', status: { $in: ['approved', 'completed'] } });
    const totalWelfareGrants = welfareDisbursements.reduce((acc, d) => acc + d.amount, 0);

    // Pending disbursements (for treasurer)
    const pendingDisbursements = await Disbursement.find({ status: 'pending' });
    const pendingDisbursementAmount = pendingDisbursements.reduce((acc, d) => acc + d.amount, 0);
    const pendingDisbursementCount = pendingDisbursements.length;

    // Pending withdrawal requests (for treasurer)
    const pendingWithdrawals = await Disbursement.find({ status: 'pending', type: 'withdrawal' });
    const pendingWithdrawalAmount = pendingWithdrawals.reduce((acc, d) => acc + d.amount, 0);

    // ═══════════════════════════════════════════════════════════════════════
    // ADVISOR STATS
    // ═══════════════════════════════════════════════════════════════════════
    const visionCount = await Vision.countDocuments({});
    const recentVisions = await Vision.find({}).sort({ createdAt: -1 }).limit(5);
    const avgSentiment = visionCount > 0 ? (recentVisions.reduce((acc, v) => acc + (v.upvotes || 0), 0) / recentVisions.length) * 10 : 0;

    // ═══════════════════════════════════════════════════════════════════════
    // ORGANIZER STATS
    // ═══════════════════════════════════════════════════════════════════════
    const upcomingMeetings = await Meeting.countDocuments({ date: { $gte: now } });
    const completedMeetings = await Meeting.find({ status: 'completed' });
    const totalAttendance = completedMeetings.reduce((acc, m) => acc + (m.attendees?.length || 0), 0);
    const avgAttendance = completedMeetings.length > 0 ? Math.round(totalAttendance / completedMeetings.length) : 0;
    const totalMeetings = await Meeting.countDocuments({});

    // ═══════════════════════════════════════════════════════════════════════
    // AUDIT STATS
    // ═══════════════════════════════════════════════════════════════════════
    const totalTxCount = await Transaction.countDocuments({});
    const auditLogsCount = await AuditLog.countDocuments({});

    // ═══════════════════════════════════════════════════════════════════════
    // ROLE BREAKDOWN (for super_admin)
    // ═══════════════════════════════════════════════════════════════════════
    const roleCounts = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);
    const roleBreakdown = {};
    roleCounts.forEach(r => { roleBreakdown[r._id] = r.count; });

    // ═══════════════════════════════════════════════════════════════════════
    // RECENT MEMBERS (for group_leader / admin)
    // ═══════════════════════════════════════════════════════════════════════
    const recentMembers = await User.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name role status createdAt facialUpload');

    // ═══════════════════════════════════════════════════════════════════════
    // TOP CONTRIBUTORS (for transparency)
    // ═══════════════════════════════════════════════════════════════════════
    const topContributorsAgg = await Contribution.aggregate([
      { $match: { status: 'confirmed' } },
      { $group: { _id: '$user', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
      { $limit: 5 }
    ]);
    // Populate names
    const topContributorIds = topContributorsAgg.map(t => t._id);
    const topContributorUsers = await User.find({ _id: { $in: topContributorIds } }).select('name facialUpload');
    const topContributors = topContributorsAgg.map(t => {
      const u = topContributorUsers.find(u => u._id.toString() === t._id.toString());
      return { name: u?.name || 'Unknown', avatar: u?.facialUpload || null, total: t.total, count: t.count };
    });

    // ═══════════════════════════════════════════════════════════════════════
    // TREASURY TOLL — SHARED TRANSPARENCY WIDGET
    // Every role sees this; it shows the financial health of the brotherhood
    // ═══════════════════════════════════════════════════════════════════════
    const treasuryToll = {
      totalPoolBalance: poolBalance,
      totalInflow,
      totalOutflow: totalLoansOutflow + totalDisbursementsOutflow,
      totalRepaymentsIn,
      totalLoansOutflow,
      totalDisbursementsOutflow,
      monthlyInflow: monthlyInflowTotal,
      activeLoansCount: activeLoans.length,
      activeLoansAmount: totalActiveLoansAmount,
      pendingLoansCount: pendingLoans.length,
      pendingDisbursementCount,
      pendingDisbursementAmount,
      pendingWithdrawalAmount,
      welfareGrantsTotal: totalWelfareGrants,
      savingsGoal,
      goalProgress: savingsGoal > 0 ? Math.min(100, Math.round((poolBalance / savingsGoal) * 100)) : 0,
      weeklyContributionAmount: settings.weeklyContributionAmount,
      collectionRate: memberCount > 0 ? Math.round((totalPaid / memberCount) * 100) : 0,
      totalMembers: memberCount,
      paidThisMonth: totalPaid,
      unpaidThisMonth: totalUnpaid,
      lastUpdated: now.toISOString(),
    };

    // ═══════════════════════════════════════════════════════════════════════
    // COMBINED RESPONSE
    // ═══════════════════════════════════════════════════════════════════════
    res.json({
      poolBalance,
      savingsGoal,
      totalPaid,
      totalUnpaid,
      totalMembers: memberCount,
      activeMembers,
      pendingMembers,
      suspendedMembers,
      recentTransactions,
      monthlyChart,
      topContributors,
      recentMembers: recentMembers.map(m => ({
        id: m._id,
        name: m.name,
        role: m.role,
        status: m.status,
        joinedAt: m.createdAt,
        avatar: m.facialUpload || null,
      })),
      roleBreakdown,
      treasuryToll,
      myStats: {
        totalContributions: myTotalContributions,
        activeLoan: myActiveLoan ? myActiveLoan.amount : 0,
        activeLoanStatus: myActiveLoan ? myActiveLoan.status : null,
        pendingLoan: myPendingLoan ? myPendingLoan.amount : 0,
        paidThisMonth: !!myContributionThisMonth,
        seniorityDays,
        seniorityYears,
        trustScore,
        joinDate: joinDate,
      },
      stats: {
        members: memberCount,
        activeMembers,
        pendingMembers,
        welfareBalance: settings.welfareTarget || 0,
        loanFundBalance: settings.loanFundTarget || 0,
        activeLoans: activeLoans.length,
        totalLoansOut: totalActiveLoansAmount,
        pendingRequests,
        welfareApprovedRequests,
        leaderApprovedRequests,
        totalApprovedRequests,
        totalDeclinedRequests,
        totalWelfareGrants,
        visionCount,
        avgSentiment,
        upcomingMeetings,
        avgAttendance,
        totalMeetings,
        totalTxCount,
        auditLogsCount,
        pendingDisbursementCount,
        pendingDisbursementAmount,
        pendingWithdrawalAmount,
        pendingLoansCount: pendingLoans.length,
        payoutRate: memberCount > 0 ? Math.round((totalPaid / memberCount) * 100) : 0,
        weeklyContributionAmount: settings.weeklyContributionAmount,
        maxLoanAmount: settings.maxLoanAmount,
        loanInterestRate: settings.loanInterestRate,
      },
      liquidityRatio: savingsGoal > 0 ? (poolBalance / savingsGoal) : 0
    });
  } catch (error) {
    console.error(error);
    res.status(500);
    throw new Error('Error fetching dashboard data');
  }
};

module.exports = {
  getDashboardSummary,
};
