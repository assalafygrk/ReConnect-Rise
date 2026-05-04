const Vote = require('../models/Vote');
const { createNotification } = require('./notificationController');

// @desc    Get all votes
// @route   GET /api/votes
// @access  Private
const transformVote = (v, userId) => {
  const resultsObj = {};
  if (v.results instanceof Map || (v.results && typeof v.results.forEach === 'function')) {
    v.results.forEach((val, key) => { resultsObj[key] = val; });
  } else if (v.results) {
    Object.assign(resultsObj, v.results);
  }
  
  const hasVoted = v.voters?.includes(userId);
  const myVote = v.userChoices ? (v.userChoices instanceof Map ? v.userChoices.get(userId.toString()) : v.userChoices[userId.toString()]) : null;
  
  const showResults = hasVoted || v.status === 'closed';
  
  return {
    ...v._doc,
    id: v._id,
    results: showResults ? resultsObj : {},
    myVote: myVote,
    voted: hasVoted,
    showResults: showResults
  };
};

const getVotes = async (req, res) => {
  const votes = await Vote.find({}).populate('candidates', 'name facialUpload').sort({ createdAt: -1 });
  const transformed = votes.map(v => transformVote(v, req.user._id));
  res.json(transformed);
};

// @desc    Create a vote
// @route   POST /api/votes
// @access  Private/Admin/GroupLeader/Treasurer
const createVote = async (req, res) => {
  const { question, description, options, candidates, type, deadline, amount, totalEligible } = req.body;
  
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
    candidates: candidates || [],
    type,
    deadline,
    amount,
    totalEligible,
    createdBy: req.user._id,
  });

  await vote.populate('candidates', 'name facialUpload');
  res.status(201).json(transformVote(vote, req.user._id));

  // Notify all members
  await createNotification({
    isGlobal: true,
    title: 'New Vote Required',
    message: `A new vote has been created: "${question}". Please cast your ballot.`,
    type: 'warning',
    link: '/votes'
  });
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

  if (vote.status === 'closed' || (vote.deadline && new Date(vote.deadline) < new Date())) {
    res.status(400);
    throw new Error('Voting is closed or deadline has passed');
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
  
  // Track individual choice
  if (!vote.userChoices) vote.userChoices = new Map();
  vote.userChoices.set(req.user._id.toString(), choice);

  await vote.save();
  
  const resultsObj = {};
  if (vote.results instanceof Map || (vote.results && typeof vote.results.forEach === 'function')) {
    vote.results.forEach((val, key) => { resultsObj[key] = val; });
  } else {
    Object.assign(resultsObj, vote.results);
  }
  
  res.json(transformVote(vote, req.user._id));
};

const closeVote = async (req, res) => {
  const vote = await Vote.findById(req.params.id);
  if (vote) {
    vote.status = 'closed';
    await vote.save();

    // Calculate winner
    const resultsObj = {};
    if (vote.results instanceof Map) {
      vote.results.forEach((val, key) => { resultsObj[key] = val; });
    } else {
      Object.assign(resultsObj, vote.results);
    }
    const winner = Object.entries(resultsObj).reduce((a, b) => (b[1] > (a[1] || 0) ? b : a), [null, 0])[0];

    res.json(vote);

    // Notify all members about the result
    await createNotification({
      isGlobal: true,
      title: 'Vote Results Finalized',
      message: `The vote for "${vote.question}" has ended. ${winner ? `Winner: ${winner}` : 'No clear winner.'}`,
      type: 'success',
      link: '/votes'
    });
  } else {
    res.status(404);
    throw new Error('Vote not found');
  }
};

module.exports = { getVotes, createVote, castVote, closeVote };
