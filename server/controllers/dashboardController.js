const User = require('../models/User');
const Contribution = require('../models/Contribution');
const Loan = require('../models/Loan');

// @desc    Get dashboard summary
// @route   GET /api/dashboard
// @access  Private
const getDashboardSummary = async (req, res) => {
  try {
    const memberCount = await User.countDocuments({});
    
    const contributions = await Contribution.find({ status: 'confirmed' });
    const totalWelfare = contributions
      .filter(c => c.type === 'welfare')
      .reduce((acc, c) => acc + c.amount, 0);
    const totalLoanFund = contributions
      .filter(c => c.type === 'loan_fund')
      .reduce((acc, c) => acc + c.amount, 0);

    const activeLoans = await Loan.find({ status: 'disbursed' });
    const totalLoansOut = activeLoans.reduce((acc, l) => acc + l.amount, 0);

    // Mocking some data for charts/trends if needed by frontend
    const recentActivity = await Contribution.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name');

    const currentYear = new Date().getFullYear();
    const monthlyChartData = await Contribution.aggregate([
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
      },
      { $sort: { "_id.month": 1 } }
    ]);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyChart = months.map((month, index) => {
      const dataForMonth = monthlyChartData.find(d => d._id.month === index + 1);
      return {
        name: month,
        total: dataForMonth ? dataForMonth.total : 0
      };
    });

    res.json({
      stats: {
        members: memberCount,
        welfareBalance: totalWelfare,
        loanFundBalance: totalLoanFund,
        activeLoans: activeLoans.length,
        totalLoansOut: totalLoansOut,
      },
      recentActivity,
      monthlyChart
    });
  } catch (error) {
    res.status(500);
    throw new Error('Error fetching dashboard data');
  }
};

module.exports = {
  getDashboardSummary,
};
