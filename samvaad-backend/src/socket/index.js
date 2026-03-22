const { Server } = require('socket.io');
const { verifyToken } = require('../utils/jwt');
const User = require('../models/User.model');
const logger = require('../utils/logger');
const registerRoomSocket = require('./room.socket');
const registerChatSocket = require('./chat.socket');

const initSocket = (server) => {
  const io = new Server(server, {
    cors: { origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true },
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Unauthorized'));
      const decoded = verifyToken(token);
      socket.user = await User.findById(decoded.id).select('name avatar');
      if (!socket.user) return next(new Error('User not found'));
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.user.name} [${socket.id}]`);
    registerRoomSocket(io, socket);
    registerChatSocket(io, socket);
    socket.on('disconnect', () => logger.info(`Socket disconnected: ${socket.user.name}`));
  });

  return io;
};

module.exports = { initSocket };
