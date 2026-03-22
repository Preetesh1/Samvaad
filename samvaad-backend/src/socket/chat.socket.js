const Meeting = require('../models/Meeting.model');

module.exports = (io, socket) => {
  socket.on('chat:message', async ({ roomId, text }) => {
    if (!text?.trim()) return;
    const message = {
      sender: socket.user._id,
      senderName: socket.user.name,
      text: text.trim(),
      sentAt: new Date(),
    };
    await Meeting.findOneAndUpdate(
      { roomId, status: 'active' },
      { $push: { messages: message } }
    );
    io.to(roomId).emit('chat:message', { ...message, senderAvatar: socket.user.avatar });
  });
};
