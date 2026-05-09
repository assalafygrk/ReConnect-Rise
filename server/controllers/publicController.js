const User = require('../models/User');
const Loan = require('../models/Loan');
const Disbursement = require('../models/Disbursement');
const Vision = require('../models/Vision');

// @desc    Get public system stats for landing page
// @route   GET /api/public/stats
// @access  Public
const getPublicStats = async (req, res) => {
  try {
    const memberCount = await User.countDocuments({});
    
    const loans = await Loan.find({ status: { $in: ['disbursed', 'active', 'repaid', 'disbursed_cash'] } });
    const totalLoans = loans.reduce((acc, l) => acc + (l.amount || 0), 0);
    
    const disbursements = await Disbursement.find({ status: { $in: ['approved', 'completed'] } });
    const totalDisbursements = disbursements.reduce((acc, d) => acc + (d.amount || 0), 0);
    
    const visionCount = await Vision.countDocuments({});

    // We can add some "Base" numbers if the community is just starting, 
    // or keep it raw. The user requested "Real".
    res.json({
      activeMembers: memberCount,
      totalDistributed: totalLoans + totalDisbursements,
      communityProjects: visionCount,
      countriesServed: 1 // Default to 1 for a starting community
    });
  } catch (error) {
    console.error('Public Stats Error:', error);
    res.status(500).json({ message: 'Error fetching public stats' });
  }
};

module.exports = { getPublicStats };
