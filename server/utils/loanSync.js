const Loan = require('../models/Loan');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

/**
 * Automatically deducts loan repayments from user wallets if the loan is overdue.
 * This should be called periodically (e.g., when an admin/treasurer loads the dashboard).
 */
const syncOverdueLoans = async () => {
  try {
    const overdueLoans = await Loan.find({
      status: { $in: ['active', 'disbursed_cash'] },
      balance: { $gt: 0 },
    }).populate('user');

    const now = new Date();
    let deductionsCount = 0;

    for (const loan of overdueLoans) {
      if (!loan.user) continue;

      // Calculate due date based on disbursedAt + duration (months)
      const startDate = loan.disbursedAt || loan.createdAt;
      const dueDate = new Date(startDate);
      dueDate.setMonth(dueDate.getMonth() + (loan.duration || 1));

      // If overdue and user has money in wallet
      if (now > dueDate && loan.user.walletBalance > 0) {
        const deductAmount = Math.min(loan.user.walletBalance, loan.balance);
        
        if (deductAmount > 0) {
          // Perform deduction
          loan.user.walletBalance -= deductAmount;
          await loan.user.save();

          // Update loan
          loan.amountRepaid = (loan.amountRepaid || 0) + deductAmount;
          loan.balance -= deductAmount;
          
          if (loan.balance <= 0) {
            loan.status = 'repaid';
            loan.balance = 0;
          }
          await loan.save();

          // Record transaction
          await Transaction.create({
            user: loan.user._id,
            type: 'debit',
            amount: deductAmount,
            note: `Auto-deduction for overdue loan (${loan.purpose})`,
            relatedUser: loan.user._id,
          });

          deductionsCount++;
        }
      }
    }

    if (deductionsCount > 0) {
      console.log(`[Auto-Deduction] Successfully processed ${deductionsCount} overdue loan repayments.`);
    }

    return deductionsCount;
  } catch (error) {
    console.error('[Auto-Deduction Error]:', error);
    return 0;
  }
};

module.exports = { syncOverdueLoans };
