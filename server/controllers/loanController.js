const Loan = require('../models/Loan');
const Transaction = require('../models/Transaction');

// @desc    Get all loans
// @route   GET /api/loans
// @access  Private
// @desc    Get all loans
// @route   GET /api/loans
// @access  Private
const getLoans = async (req, res) => {
  const loans = await Loan.find({})
    .populate('user', 'name email')
    .sort({ createdAt: -1 });
  
  const transformed = loans.map(l => ({
    ...l._doc,
    member: l.user?.name || 'Unknown',
  }));
  
  res.json(transformed);
};

// @desc    Request a loan
// @route   POST /api/loans
// @access  Private
const requestLoan = async (req, res) => {
  const { amount, purpose, duration } = req.body;

  const loan = await Loan.create({
    user: req.user._id,
    amount,
    purpose,
    duration,
    balance: amount,
  });

  if (loan) {
    const populated = await Loan.findById(loan._id).populate('user', 'name');
    res.status(201).json({
      ...populated._doc,
      member: populated.user?.name || 'Unknown'
    });
  } else {
    res.status(400);
    throw new Error('Invalid loan data');
  }
};

// @desc    Update loan status (approve/reject)
// @route   PUT /api/loans/:id/status
// @access  Private/Admin/Treasurer
const updateLoanStatus = async (req, res) => {
  const loan = await Loan.findById(req.params.id);

  if (loan) {
    loan.status = req.body.status || loan.status;
    if (req.body.status === 'approved') {
        loan.approvedBy = req.user._id;
        loan.repaymentDate = new Date(Date.now() + loan.duration * 30 * 24 * 60 * 60 * 1000);
        
        // Log transaction
        await Transaction.create({
            user: loan.user,
            type: 'debit',
            amount: loan.amount,
            note: `Loan Disbursed: ${loan.purpose}`,
            relatedUser: req.user._id
        });
    }
    const updatedLoan = await loan.save();
    const populated = await Loan.findById(updatedLoan._id).populate('user', 'name');
    res.json({
      ...populated._doc,
      member: populated.user?.name || 'Unknown'
    });
  } else {
    res.status(404);
    throw new Error('Loan not found');
  }
};

// @desc    Record loan repayment
// @route   POST /api/loans/:id/repay
// @access  Private/Admin/Treasurer
const recordRepayment = async (req, res) => {
  const { amount } = req.body;
  const loan = await Loan.findById(req.params.id);

  if (loan) {
    loan.amountRepaid = (loan.amountRepaid || 0) + amount;
    loan.balance = loan.balance - amount;

    if (loan.balance <= 0) {
      loan.status = 'repaid';
      loan.balance = 0;
    }

    // Log repayment transaction
    await Transaction.create({
        user: loan.user,
        type: 'credit',
        amount: amount,
        note: `Loan Repayment: ${loan.purpose}`,
        relatedUser: req.user._id
    });

    const updatedLoan = await loan.save();
    const populated = await Loan.findById(updatedLoan._id).populate('user', 'name');
    res.json({
      ...populated._doc,
      member: populated.user?.name || 'Unknown'
    });
  } else {
    res.status(404);
    throw new Error('Loan not found');
  }
};

module.exports = {
  getLoans,
  requestLoan,
  updateLoanStatus,
  recordRepayment,
};
