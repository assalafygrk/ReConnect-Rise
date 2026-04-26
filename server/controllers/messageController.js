const Message = require('../models/Message');

const getMessages = async (req, res) => {
  const { roomId } = req.query;
  const messages = await Message.find({ roomId: roomId || 'public' })
    .populate('sender', 'name')
    .sort({ createdAt: 1 });
  
  const transformed = messages.map(m => ({
    ...m._doc,
    senderName: m.sender?.name || 'Unknown',
    isMe: m.sender?._id.toString() === req.user?._id.toString()
  }));
  
  res.json(transformed);
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
  
  const populated = await Message.findById(message._id).populate('sender', 'name');
  res.status(201).json({
    ...populated._doc,
    senderName: populated.sender?.name || 'Unknown',
    isMe: true
  });
};

module.exports = { getMessages, sendMessage };
