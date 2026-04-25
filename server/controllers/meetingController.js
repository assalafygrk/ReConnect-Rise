const Meeting = require('../models/Meeting');

const getMeetings = async (req, res) => {
  const meetings = await Meeting.find({}).populate('organizer', 'name');
  res.json(meetings);
};

const addMeeting = async (req, res) => {
  const { title, date, time, location, description } = req.body;
  const meeting = await Meeting.create({
    title,
    date,
    time,
    location,
    description,
    organizer: req.user._id,
  });
  res.status(201).json(meeting);
};

module.exports = { getMeetings, addMeeting };
