const Request = require('../models/Request');

// @desc    Get all requests
// @route   GET /api/requests
// @access  Private
const getRequests = async (req, res) => {
  const requests = await Request.find({})
    .populate('user', 'name email')
    .sort({ createdAt: -1 });
  
  const transformed = requests.map(r => ({
    ...r._doc,
    member: r.user?.name || 'Unknown',
  }));
  
  res.json(transformed);
};

// @desc    Submit a request
// @route   POST /api/requests
// @access  Private
const submitRequest = async (req, res) => {
  const { type, amount, description } = req.body;
  const request = await Request.create({
    user: req.user._id,
    type,
    amount,
    description,
  });
  
  const populated = await Request.findById(request._id).populate('user', 'name');
  res.status(201).json({
    ...populated._doc,
    member: populated.user?.name || 'Unknown'
  });
};

// @desc    Update request status
// @route   PUT /api/requests/:id/status
// @access  Private/Admin
const updateRequestStatus = async (req, res) => {
  const request = await Request.findById(req.params.id);
  if (request) {
    request.status = req.body.status || request.status;
    request.note = req.body.note || request.note;
    const updatedRequest = await request.save();
    
    const populated = await Request.findById(updatedRequest._id).populate('user', 'name');
    res.json({
      ...populated._doc,
      member: populated.user?.name || 'Unknown'
    });
  } else {
    res.status(404);
    throw new Error('Request not found');
  }
};

module.exports = { getRequests, submitRequest, updateRequestStatus };
