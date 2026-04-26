const User = require('../models/User');
const Contribution = require('../models/Contribution');
const Loan = require('../models/Loan');
const Transaction = require('../models/Transaction');
const Settings = require('../models/Settings');
const Disbursement = require('../models/Disbursement');

// @desc    Get dashboard summary
// @route   GET /api/dashboard
// @access  Private
const getDashboardSummary = async (req, res) => {
  try {
    const memberCount = await User.countDocuments({});
    
    // Get confirmed contributions
    const contributions = await Contribution.find({ status: 'confirmed' });
    const totalWelfare = contributions
      .filter(c => c.type === 'welfare')
      .reduce((acc, c) => acc + c.amount, 0);
    const totalLoanFund = contributions
      .filter(c => c.type === 'loan_fund')
      .reduce((acc, c) => acc + c.amount, 0);

    const poolBalance = totalWelfare + totalLoanFund;

    // Get settings for goal
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    const savingsGoal = settings.welfareTarget + settings.loanFundTarget;

    // Active loans
    const activeLoans = await Loan.find({ status: 'disbursed' });
    const totalLoansOut = activeLoans.reduce((acc, l) => acc + l.amount, 0);

    // Recent Transactions (Global for admin/leaders, or filtered for user?)
    // DashboardPage.jsx expects 'recentTransactions' as an array of { id, member, type, note, amount, date }
    // We'll pull recent transactions and map them
    const recentTxData = await Transaction.find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('user', 'name');
    
    const recentTransactions = recentTxData.map(tx => ({
      id: tx._id,
      member: tx.user?.name || 'System',
      type: tx.type === 'credit' ? 'contribution' : 'payout',
      note: tx.note || (tx.type === 'credit' ? 'Inward Transfer' : 'Outward Transfer'),
      amount: tx.amount,
      date: tx.date
    }));

    // My Stats
    const userContributions = await Contribution.find({ user: req.user._id, status: 'confirmed' });
    const myTotalContributions = userContributions.reduce((acc, c) => acc + c.amount, 0);
    const myActiveLoan = await Loan.findOne({ user: req.user._id, status: 'disbursed' });

    // Monthly Chart Data
    const currentYear = new Date().getFullYear();
    
    // Influx (Contributions)
    const influxData = await Contribution.aggregate([
      {
        $match: {
          status: 'confirmed',
          createdAt: {
            $gte: new Date(`${currentYear}-01-01`),
            $lte: new Date(`${currentYear}-12-31T23:59:59.999Z`)
          }
        }
      },
      {
        $group: {
          _id: { month: { $month: "$createdAt" } },
          total: { $sum: "$amount" }
        }
      }
    ]);

    // Outflow (Disbursements)
    const outflowData = await Disbursement.aggregate([
      {
        $match: {
          status: 'disbursed',
          createdAt: {
            $gte: new Date(`${currentYear}-01-01`),
            $lte: new Date(`${currentYear}-12-31T23:59:59.999Z`)
          }
        }
      },
      {
        $group: {
          _id: { month: { $month: "$createdAt" } },
          total: { $sum: "$amount" }
        }
      }
    ]);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyChart = months.map((month, index) => {
      const inMonth = influxData.find(d => d._id.month === index + 1);
      const outMonth = outflowData.find(d => d._id.month === index + 1);
      return {
        month: month,
        contributions: inMonth ? inMonth.total : 0,
        disbursements: outMonth ? outMonth.total : 0
      };
    });

    res.json({
      poolBalance,
      savingsGoal,
      totalMembers: memberCount,
      recentTransactions,
      monthlyChart,
      myStats: {
        totalContributions: myTotalContributions,
        activeLoan: myActiveLoan ? myActiveLoan.amount : 0
      },
      stats: {
        members: memberCount,
        welfareBalance: totalWelfare,
        loanFundBalance: totalLoanFund,
        activeLoans: activeLoans.length,
        totalLoansOut: totalLoansOut,
      }
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
