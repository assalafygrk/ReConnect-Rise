const Contribution = require('../models/Contribution');

// @desc    Get all contributions
// @route   GET /api/contributions
// @access  Private
const getContributions = async (req, res) => {
  const { week, user } = req.query;
  const query = {};
  if (week) query.weekId = week;
  if (user) query.user = user;
  
  const contributions = await Contribution.find(query).populate('user', 'name email').sort({ createdAt: -1 });
  res.json(contributions);
};

// @desc    Record a new contribution
// @route   POST /api/contributions
// @access  Private/Treasurer/Admin
const recordContribution = async (req, res) => {
  const { memberId, weekId, type, amount, bonus, note } = req.body;

  const contribution = await Contribution.create({
    user: memberId,
    weekId,
    type: type || 'welfare',
    amount,
    bonus: bonus || 0,
    note,
    status: 'confirmed'
  });

  if (contribution) {
    res.status(201).json(contribution);
  } else {
    res.status(400);
    throw new Error('Invalid contribution data');
  }
};

// @desc    Record batch contributions
// @route   POST /api/contributions/batch
// @access  Private/Treasurer/Admin
const recordBatchContributions = async (req, res) => {
  const { weekId, contributions } = req.body;

  if (!weekId || !contributions || !Array.isArray(contributions)) {
    res.status(400);
    throw new Error('Invalid batch data');
  }

  try {
    const operations = contributions.map(c => ({
      updateOne: {
        filter: { user: c.memberId, weekId },
        update: { 
          $set: { 
            amount: c.amount, 
            bonus: c.bonus, 
            note: c.note, 
            status: c.paid ? 'confirmed' : 'pending',
            type: c.type || 'welfare'
          } 
        },
        upsert: true
      }
    }));

    await Contribution.bulkWrite(operations);
    res.json({ message: 'Ledger synchronized' });
  } catch (error) {
    res.status(500);
    throw new Error('Batch synchronization failed');
  }
};

// @desc    Get unique week IDs
// @route   GET /api/contributions/weeks
// @access  Private
const getWeeks = async (req, res) => {
  try {
    const weeks = await Contribution.distinct('weekId');
    res.json(weeks);
  } catch (error) {
    res.status(500);
    throw new Error('Error fetching weeks');
  }
};

module.exports = {
  getContributions,
  recordContribution,
  recordBatchContributions,
  getWeeks,
};
