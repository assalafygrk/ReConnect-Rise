const Disbursement = require('../models/Disbursement');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

// @desc    Get all disbursements
// @route   GET /api/disbursements
// @access  Private
const getDisbursements = async (req, res) => {
  const disbursements = await Disbursement.find({})
    .populate('memberId', 'name email')
    .sort({ createdAt: -1 });
  
  // Transform for frontend if needed
  const transformed = disbursements.map(d => ({
    ...d._doc,
    member: d.memberId?.name || 'Unknown',
  }));
  
  res.json(transformed);
};

// @desc    Add a disbursement
// @route   POST /api/disbursements
// @access  Private/Treasurer/Admin
const addDisbursement = async (req, res) => {
  const { memberId, member, amount, reason, type, method, status } = req.body;

  // If memberId is missing but member (name) is provided, try to find user
  let targetMemberId = memberId;
  if (!targetMemberId && member) {
    const user = await User.findOne({ name: new RegExp(`^${member}$`, 'i') });
    if (user) targetMemberId = user._id;
  }

  if (!targetMemberId) {
    res.status(400);
    throw new Error('Member identity required for disbursement');
  }

  const disbursement = await Disbursement.create({
    memberId: targetMemberId,
    amount,
    reason,
    type: type || 'welfare',
    method: method || 'Bank Transfer',
    status: status || 'pending'
  });

  if (disbursement.status === 'approved') {
      await Transaction.create({
          user: targetMemberId,
          type: 'debit',
          amount: amount,
          note: `Disbursement: ${reason}`,
          relatedUser: req.user._id
      });
  }

  const populated = await Disbursement.findById(disbursement._id).populate('memberId', 'name');
  
  res.status(201).json({
    ...populated._doc,
    member: populated.memberId?.name || 'Unknown'
  });
};

// @desc    Update disbursement status (Approve/Decline)
// @route   PATCH /api/disbursements/:id/status
// @access  Private/Treasurer/Admin
const updateDisbursementStatus = async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;

  if (!['pending', 'approved', 'declined', 'completed'].includes(status)) {
    res.status(400);
    throw new Error('Invalid status');
  }

  const disbursement = await Disbursement.findById(id);

  if (disbursement) {
    const oldStatus = disbursement.status;
    disbursement.status = status;
    const updatedDisbursement = await disbursement.save();
    
    if (oldStatus !== 'approved' && status === 'approved') {
        await Transaction.create({
            user: disbursement.memberId,
            type: 'debit',
            amount: disbursement.amount,
            note: `Disbursement Approved: ${disbursement.reason}`,
            relatedUser: req.user._id
        });
    }
    
    const populated = await Disbursement.findById(updatedDisbursement._id).populate('memberId', 'name');
    res.json({
      ...populated._doc,
      member: populated.memberId?.name || 'Unknown'
    });
  } else {
    res.status(404);
    throw new Error('Disbursement not found');
  }
};

module.exports = { getDisbursements, addDisbursement, updateDisbursementStatus };
