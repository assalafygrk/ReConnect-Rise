const AuditLog = require('../models/AuditLog');

const getLogs = async (req, res) => {
  const { page = 1, limit = 100, category, search, from, to } = req.query;

  const filter = {};

  // Category filter
  if (category && category !== 'all') {
    filter.category = category;
  }

  // Search filter — matches user, action, or detail
  if (search) {
    const regex = new RegExp(search, 'i');
    filter.$or = [
      { user: regex },
      { action: regex },
      { detail: regex }
    ];
  }

  // Date range filter
  if (from || to) {
    filter.timestamp = {};
    if (from) filter.timestamp.$gte = new Date(from);
    if (to) filter.timestamp.$lte = new Date(to);
  }

  const total = await AuditLog.countDocuments(filter);
  const logs = await AuditLog.find(filter)
    .sort({ timestamp: -1 })
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit));

  res.json({
    logs,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
  });
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

const clearLogs = async (req, res) => {
  await AuditLog.deleteMany({});
  res.json({ message: 'Audit Ledger purged successfully' });
};

module.exports = { getLogs, addLog, clearLogs };
