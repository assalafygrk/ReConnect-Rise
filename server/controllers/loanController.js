const Loan = require('../models/Loan');

// @desc    Get all loans
// @route   GET /api/loans
// @access  Private
const getLoans = async (req, res) => {
  const loans = await Loan.find({}).populate('user', 'name email');
  res.json(loans);
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
    res.status(201).json(loan);
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
    }
    const updatedLoan = await loan.save();
    res.json(updatedLoan);
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

    const updatedLoan = await loan.save();
    res.json(updatedLoan);
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
