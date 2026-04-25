const Message = require('../models/Message');

const getMessages = async (req, res) => {
  const { roomId } = req.query;
  const messages = await Message.find({ roomId }).populate('sender', 'name');
  res.json(messages);
};

const sendMessage = async (req, res) => {
  const { roomId, text, type, content } = req.body;
  const message = await Message.create({
    roomId: roomId || 'public',
    sender: req.user._id,
    text,
    type,
    content,
  });
  res.status(201).json(message);
};

module.exports = { getMessages, sendMessage };
