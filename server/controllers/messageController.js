const Message = require('../models/Message');

const getMessages = async (req, res) => {
  const { roomId } = req.query;
  const messages = await Message.find({ roomId: roomId || 'public' })
    .populate('sender', 'name role facialUpload')
    .sort({ createdAt: 1 });
  
  const transformed = messages.map(m => {
    const isSuperAdmin = m.sender?.role === 'super_admin';
    return {
      ...m._doc,
      senderName: isSuperAdmin ? 'ReConnect & Rise System' : (m.sender?.name || 'Unknown'),
      senderAvatar: isSuperAdmin ? '/system-avatar.png' : m.sender?.facialUpload,
      isMe: m.sender?._id.toString() === req.user?._id.toString()
    };
  });
  
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
  
  const populated = await Message.findById(message._id).populate('sender', 'name role facialUpload');
  const isSuperAdmin = populated.sender?.role === 'super_admin';
  
  res.status(201).json({
    ...populated._doc,
    senderName: isSuperAdmin ? 'ReConnect & Rise System' : (populated.sender?.name || 'Unknown'),
    senderAvatar: isSuperAdmin ? '/system-avatar.png' : populated.sender?.facialUpload,
    isMe: true
  });
};

module.exports = { getMessages, sendMessage };
