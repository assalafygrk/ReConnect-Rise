const Request = require('../models/Request');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { createNotification } = require('./notificationController');

async function populateRequest(query) {
  return query
    .populate('user', 'name email walletBalance')
    .populate('welfareApprovedBy', 'name')
    .populate('leaderApprovedBy', 'name')
    .populate('treasurerApprovedBy', 'name');
}

function transformRequest(r) {
  if (!r) return null;
  const doc = r._doc || r;
  return { ...doc, member: r.user?.name || 'Unknown', date: doc.createdAt || doc.date, id: doc._id };
}

// GET all (role-filtered)
const getRequests = async (req, res) => {
  const privileged = ['super_admin','admin','treasurer','welfare','groupleader','group_leader'];
  const query = privileged.includes(req.user.role) ? {} : { user: req.user._id };
  const requests = await populateRequest(Request.find(query).sort({ createdAt: -1 }));
  res.json(requests.map(transformRequest));
};

// POST — member submits
const submitRequest = async (req, res) => {
  const { type, amount, description, paymentMethod } = req.body;
  if (!type || !amount || !description) { res.status(400); throw new Error('type, amount, description required'); }
  if (Number(amount) <= 0) { res.status(400); throw new Error('Amount must be positive'); }
  const request = await Request.create({
    user: req.user._id, type, amount: Number(amount), description,
    paymentMethod: paymentMethod || 'wallet', status: 'pending',
  });
  const populated = await populateRequest(Request.findById(request._id));

  // Notify Welfare Officer and Admin
  await createNotification({
    role: 'welfare',
    title: 'New Welfare Request',
    message: `Brother ${req.user.name} has submitted a welfare request for ${type} (₦${amount.toLocaleString()}).`,
    type: 'warning',
    link: '/requests'
  });

  res.status(201).json(transformRequest(populated));
};

// PATCH /:id/welfare — Welfare Officer: approve → welfare_approved | decline
const welfareOfficerAction = async (req, res) => {
  const { action, note, declineReason } = req.body;
  const request = await Request.findById(req.params.id);
  if (!request) { res.status(404); throw new Error('Request not found'); }
  if (request.status !== 'pending') { res.status(400); throw new Error(`Can only act on pending requests. Status: ${request.status}`); }
  if (action === 'approve') {
    request.status = 'welfare_approved';
    request.welfareApprovedBy = req.user._id;
    request.welfareApprovedAt = new Date();
    if (note) request.note = note;
  } else if (action === 'decline') {
    request.status = 'declined';
    request.declineReason = declineReason || 'Declined by Welfare Officer';
  } else { res.status(400); throw new Error('action must be: approve | decline'); }
  await request.save();
  const populated = await populateRequest(Request.findById(request._id));

  // Notifications
  if (action === 'approve') {
    await createNotification({
      role: 'group_leader',
      title: 'Welfare Request Pending Leader',
      message: `A welfare request for ${populated.user.name} has been approved by the Welfare Officer and awaits your approval.`,
      type: 'info',
      link: '/requests'
    });
  } else {
    await createNotification({
      recipient: populated.user._id,
      title: 'Welfare Request Declined',
      message: `Your welfare request for ₦${populated.amount.toLocaleString()} was declined by the Welfare Officer.`,
      type: 'urgent',
      link: '/requests'
    });
  }
  res.json(transformRequest(populated));
};

// PATCH /:id/leader — Group Leader: approve → leader_approved | decline
const leaderAction = async (req, res) => {
  const { action, note, declineReason } = req.body;
  const request = await Request.findById(req.params.id);
  if (!request) { res.status(404); throw new Error('Request not found'); }
  if (request.status !== 'welfare_approved') { res.status(400); throw new Error(`Can only act on welfare_approved requests. Status: ${request.status}`); }
  if (action === 'approve') {
    request.status = 'leader_approved';
    request.leaderApprovedBy = req.user._id;
    request.leaderApprovedAt = new Date();
    if (note) request.note = note;
  } else if (action === 'decline') {
    request.status = 'declined';
    request.declineReason = declineReason || 'Declined by Group Leader';
  } else { res.status(400); throw new Error('action must be: approve | decline'); }
  await request.save();
  const populated = await populateRequest(Request.findById(request._id));
  res.json(transformRequest(populated));
};

// PATCH /:id/treasurer — Treasurer: approve (disburse) | decline
const treasurerAction = async (req, res) => {
  const { action, declineReason } = req.body;
  const request = await Request.findById(req.params.id).populate('user');
  if (!request) { res.status(404); throw new Error('Request not found'); }
  if (request.status !== 'leader_approved') { res.status(400); throw new Error(`Can only act on leader_approved requests. Status: ${request.status}`); }

  if (action === 'decline') {
    request.status = 'declined';
    request.declineReason = declineReason || 'Declined by Treasurer';
    await request.save();
    const populated = await populateRequest(Request.findById(request._id));
    return res.json(transformRequest(populated));
  }

  if (action !== 'approve') { res.status(400); throw new Error('action must be: approve | decline'); }

  request.status = 'approved';
  request.treasurerApprovedBy = req.user._id;
  request.disbursedAt = new Date();

  const memberId = request.user?._id || request.user;
  const member = await User.findById(memberId);
  if (!member) { res.status(404); throw new Error('Beneficiary not found'); }

  if (request.paymentMethod === 'wallet') {
    member.walletBalance = (member.walletBalance || 0) + request.amount;
    await member.save();
  }
  await Transaction.create({
    user: member._id, type: 'credit', amount: request.amount,
    note: `Welfare ${request.paymentMethod === 'wallet' ? '(wallet)' : '(cash)'}: ${request.type}`,
    relatedUser: req.user._id,
  });

  await request.save();
  const populated = await populateRequest(Request.findById(request._id));

  // Notify Member
  await createNotification({
    recipient: memberId,
    title: 'Welfare Funds Disbursed',
    message: `Your welfare request for ₦${populated.amount.toLocaleString()} has been approved and funds disbursed.`,
    type: 'success',
    link: '/requests'
  });

  res.json(transformRequest(populated));
};

// PUT /:id/status — legacy
const updateRequestStatus = async (req, res) => {
  const request = await Request.findById(req.params.id);
  if (!request) { res.status(404); throw new Error('Request not found'); }
  request.status = req.body.status || request.status;
  request.note = req.body.note || request.note;
  await request.save();
  const populated = await populateRequest(Request.findById(request._id));
  res.json(transformRequest(populated));
};

module.exports = { getRequests, submitRequest, welfareOfficerAction, leaderAction, treasurerAction, updateRequestStatus };
