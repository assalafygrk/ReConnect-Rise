const Disbursement = require('../models/Disbursement');

const getDisbursements = async (req, res) => {
  const disbursements = await Disbursement.find({}).populate('memberId', 'name');
  res.json(disbursements);
};

const addDisbursement = async (req, res) => {
  const disbursement = await Disbursement.create(req.body);
  res.status(201).json(disbursement);
};

module.exports = { getDisbursements, addDisbursement };
