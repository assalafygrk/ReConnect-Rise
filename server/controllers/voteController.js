const Vote = require('../models/Vote');

const getVotes = async (req, res) => {
  const votes = await Vote.find({}).sort({ createdAt: -1 });
  res.json(votes);
};

const createVote = async (req, res) => {
  const { title, description, options } = req.body;
  const vote = await Vote.create({
    title,
    description,
    options,
    createdBy: req.user._id,
  });
  res.status(201).json(vote);
};

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
  const currentVotes = vote.results.get(choice) || 0;
  vote.results.set(choice, currentVotes + 1);
  vote.voters.push(req.user._id);

  await vote.save();
  res.json(vote);
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
