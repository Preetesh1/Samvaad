const roomService = require('../services/room.service');
const logger = require('../utils/logger');

module.exports = (io, socket) => {
  socket.on('room:join', async ({ roomId }) => {
    try {
      await roomService.joinRoom(roomId, socket.user._id);
      socket.join(roomId);
      socket.to(roomId).emit('room:user-joined', {
        userId: socket.id,
        user: { _id: socket.user._id, name: socket.user.name, avatar: socket.user.avatar },
      });
      const roomSockets = await io.in(roomId).fetchSockets();
      socket.emit('room:participants', roomSockets.map(s => ({ socketId: s.id, user: s.user })));
      logger.info(`${socket.user.name} joined room ${roomId}`);
    } catch (err) {
      socket.emit('room:error', { message: err.message });
    }
  });

  socket.on('room:leave', async ({ roomId }) => {
    try {
      await roomService.leaveRoom(roomId, socket.user._id);
      socket.leave(roomId);
      socket.to(roomId).emit('room:user-left', { userId: socket.id });
    } catch (err) {
      socket.emit('room:error', { message: err.message });
    }
  });

  socket.on('room:end', async ({ roomId }) => {
    try {
      await roomService.endRoom(roomId, socket.user._id);
      io.to(roomId).emit('room:ended');
    } catch (err) {
      socket.emit('room:error', { message: err.message });
    }
  });

  socket.on('webrtc:offer', ({ to, offer }) => io.to(to).emit('webrtc:offer', { from: socket.id, offer }));
  socket.on('webrtc:answer', ({ to, answer }) => io.to(to).emit('webrtc:answer', { from: socket.id, answer }));
  socket.on('webrtc:ice-candidate', ({ to, candidate }) => io.to(to).emit('webrtc:ice-candidate', { from: socket.id, candidate }));
  socket.on('media:toggle', ({ roomId, type, value }) => socket.to(roomId).emit('media:toggle', { userId: socket.id, type, value }));
};
