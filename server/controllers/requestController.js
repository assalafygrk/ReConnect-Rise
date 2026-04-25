const Request = require('../models/Request');

const getRequests = async (req, res) => {
  const requests = await Request.find({}).populate('user', 'name');
  res.json(requests);
};

const submitRequest = async (req, res) => {
  const { type, amount, description } = req.body;
  const request = await Request.create({
    user: req.user._id,
    type,
    amount,
    description,
  });
  res.status(201).json(request);
};

const updateRequestStatus = async (req, res) => {
  const request = await Request.findById(req.params.id);
  if (request) {
    request.status = req.body.status || request.status;
    request.note = req.body.note || request.note;
    const updatedRequest = await request.save();
    res.json(updatedRequest);
  } else {
    res.status(404);
    throw new Error('Request not found');
  }
};

module.exports = { getRequests, submitRequest, updateRequestStatus };
