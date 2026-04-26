const Meeting = require('../models/Meeting');

const getMeetings = async (req, res) => {
  const meetings = await Meeting.find({}).populate('organizer', 'name');
  res.json(meetings);
};

const addMeeting = async (req, res) => {
  const { title, date, time, location, description, agenda } = req.body;
  const meeting = await Meeting.create({
    title,
    date,
    time,
    location,
    description,
    agenda,
    organizer: req.user._id,
  });
  res.status(201).json(meeting);
};

const updateMeeting = async (req, res) => {
  const { id } = req.params;
  const { minutes, status } = req.body;
  const meeting = await Meeting.findById(id);

  if (meeting) {
    meeting.minutes = minutes || meeting.minutes;
    meeting.status = status || meeting.status;
    const updated = await meeting.save();
    res.json(updated);
  } else {
    res.status(404);
    throw new Error('Meeting not found');
  }
};

module.exports = { getMeetings, addMeeting, updateMeeting };
