const Vote = require('../models/Vote');

// @desc    Get all votes
// @route   GET /api/votes
// @access  Private
const getVotes = async (req, res) => {
  const votes = await Vote.find({}).sort({ createdAt: -1 });
  
  const transformed = votes.map(v => {
    const resultsObj = {};
    if (v.results instanceof Map || (v.results && typeof v.results.forEach === 'function')) {
      v.results.forEach((val, key) => { resultsObj[key] = val; });
    } else {
      Object.assign(resultsObj, v.results);
    }
    
    // Check if user has voted
    let myVote = null;
    // This requires tracking which choice each user made. 
    // Currently, Vote model only has a list of voters.
    // I should probably update the model to track user choices if needed, 
    // but for now let's just mark if they voted.
    
    return {
      ...v._doc,
      results: resultsObj,
      voted: v.voters.includes(req.user._id)
    };
  });
  
  res.json(transformed);
};

// @desc    Create a vote
// @route   POST /api/votes
// @access  Private/Admin/GroupLeader/Treasurer
const createVote = async (req, res) => {
  const { question, description, options, type, deadline, amount, totalEligible } = req.body;
  
  let finalOptions = options;
  if (!finalOptions || finalOptions.length === 0) {
    if (type === 'budget' || type === 'decision') {
      finalOptions = ['Yes', 'No', 'Abstain'];
    } else {
      finalOptions = ['Option 1', 'Option 2'];
    }
  }

  const vote = await Vote.create({
    question,
    description,
    options: finalOptions,
    type,
    deadline,
    amount,
    totalEligible,
    createdBy: req.user._id,
  });

  res.status(201).json(vote);
};

// @desc    Cast a vote
// @route   POST /api/votes/:id/cast
// @access  Private
const castVote = async (req, res) => {
  const vote = await Vote.findById(req.params.id);
  if (!vote) {
    res.status(404);
    throw new Error('Vote not found');
  }

  if (vote.status === 'closed') {
    res.status(400);
    throw new Error('Voting is closed');
  }

  if (vote.voters.includes(req.user._id)) {
    res.status(400);
    throw new Error('You have already voted');
  }

  const { choice } = req.body;
  if (!choice) {
    res.status(400);
    throw new Error('Choice is required');
  }

  // Handle both Mongoose Map and plain object cases
  if (vote.results instanceof Map || (vote.results && typeof vote.results.get === 'function')) {
    const currentVotes = vote.results.get(choice) || 0;
    vote.results.set(choice, currentVotes + 1);
  } else {
    vote.results = vote.results || {};
    vote.results[choice] = (vote.results[choice] || 0) + 1;
    vote.markModified('results');
  }

  vote.voters.push(req.user._id);

  await vote.save();
  
  const resultsObj = {};
  if (vote.results instanceof Map || (vote.results && typeof vote.results.forEach === 'function')) {
    vote.results.forEach((val, key) => { resultsObj[key] = val; });
  } else {
    Object.assign(resultsObj, vote.results);
  }
  
  res.json({
    ...vote._doc,
    results: resultsObj,
    voted: true
  });
};

const closeVote = async (req, res) => {
  const vote = await Vote.findById(req.params.id);
  if (vote) {
    vote.status = 'closed';
    await vote.save();
    res.json(vote);
  } else {
    res.status(404);
    throw new Error('Vote not found');
  }
};

module.exports = { getVotes, createVote, castVote, closeVote };
