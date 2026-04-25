const AuditLog = require('../models/AuditLog');

const getLogs = async (req, res) => {
  const logs = await AuditLog.find({}).sort({ timestamp: -1 }).limit(200);
  res.json(logs);
};

const addLog = async (req, res) => {
  const { action, detail, category } = req.body;
  const log = await AuditLog.create({
    user: req.user.name,
    action,
    detail,
    category,
  });
  res.status(201).json(log);
};

module.exports = { getLogs, addLog };
