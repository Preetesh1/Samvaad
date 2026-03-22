#!/bin/bash

echo "🚀 Setting up Samvaad Backend..."

mkdir -p samvaad-backend/src/{config,controllers,middleware,models,routes,services,socket,utils} samvaad-backend/logs samvaad-backend/tests
cd samvaad-backend

# ── package.json ──
cat > package.json << 'EOF'
{
  "name": "samvaad-backend",
  "version": "1.0.0",
  "description": "Samvaad - Video calling backend API",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest --coverage"
  },
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.18.2",
    "express-rate-limit": "^7.2.0",
    "express-validator": "^7.0.1",
    "helmet": "^7.1.0",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^8.3.4",
    "morgan": "^1.10.0",
    "nanoid": "^3.3.7",
    "nodemailer": "^6.9.13",
    "socket.io": "^4.7.5",
    "winston": "^3.13.0"
  },
  "devDependencies": {
    "jest": "^29.7.0",
    "nodemon": "^3.1.0",
    "supertest": "^7.0.0"
  }
}
EOF

# ── server.js ──
cat > server.js << 'EOF'
const http = require('http');
const app = require('./src/app');
const { connectDB } = require('./src/config/db');
const { initSocket } = require('./src/socket');
const logger = require('./src/utils/logger');
require('./src/config/env');

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

initSocket(server);

const start = async () => {
  await connectDB();
  server.listen(PORT, () => {
    logger.info(`Samvaad server running on port ${PORT}`);
  });
};

start();
EOF

# ── src/app.js ──
cat > src/app.js << 'EOF'
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { errorHandler } = require('./middleware/error.middleware');
const routes = require('./routes');

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => res.json({ status: 'ok', app: 'Samvaad' }));
app.use('/api/v1', routes);
app.use(errorHandler);

module.exports = app;
EOF

# ── src/config/db.js ──
cat > src/config/db.js << 'EOF'
const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, { dbName: 'samvaad' });
    logger.info(`MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    logger.error(`MongoDB connection failed: ${err.message}`);
    process.exit(1);
  }
};

module.exports = { connectDB };
EOF

# ── src/config/env.js ──
cat > src/config/env.js << 'EOF'
require('dotenv').config();

const required = ['MONGO_URI', 'JWT_SECRET', 'JWT_REFRESH_SECRET'];
required.forEach((key) => {
  if (!process.env[key]) throw new Error(`Missing required env variable: ${key}`);
});
EOF

# ── src/utils/logger.js ──
cat > src/utils/logger.js << 'EOF'
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message }) =>
      `[${timestamp}] ${level}: ${message}`
    )
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

module.exports = logger;
EOF

# ── src/utils/jwt.js ──
cat > src/utils/jwt.js << 'EOF'
const jwt = require('jsonwebtoken');

const signToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

const signRefreshToken = (payload) =>
  jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '30d' });

const verifyToken = (token) => jwt.verify(token, process.env.JWT_SECRET);
const verifyRefreshToken = (token) => jwt.verify(token, process.env.JWT_REFRESH_SECRET);

module.exports = { signToken, signRefreshToken, verifyToken, verifyRefreshToken };
EOF

# ── src/utils/response.js ──
cat > src/utils/response.js << 'EOF'
const success = (res, data = {}, message = 'Success', statusCode = 200) =>
  res.status(statusCode).json({ success: true, message, data });

const error = (res, message = 'Something went wrong', statusCode = 500) =>
  res.status(statusCode).json({ success: false, message });

module.exports = { success, error };
EOF

# ── src/utils/hash.js ──
cat > src/utils/hash.js << 'EOF'
const crypto = require('crypto');

const generateToken = () => crypto.randomBytes(32).toString('hex');
const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

module.exports = { generateToken, hashToken };
EOF

# ── src/models/User.model.js ──
cat > src/models/User.model.js << 'EOF'
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, select: false },
  avatar: { type: String, default: null },
  provider: { type: String, enum: ['local', 'google'], default: 'local' },
  providerId: { type: String, default: null },
  isVerified: { type: Boolean, default: false },
  verifyToken: { type: String, default: null },
  resetToken: { type: String, default: null },
  resetTokenExpiry: { type: Date, default: null },
  lastSeen: { type: Date, default: Date.now },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.verifyToken;
  delete obj.resetToken;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
EOF

# ── src/models/Room.model.js ──
cat > src/models/Room.model.js << 'EOF'
const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomId: { type: String, required: true, unique: true },
  name: { type: String, default: 'Samvaad Room' },
  host: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  password: { type: String, default: null, select: false },
  isLocked: { type: Boolean, default: false },
  waitingRoom: { type: Boolean, default: false },
  maxParticipants: { type: Number, default: 20 },
  activeParticipants: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    joinedAt: { type: Date, default: Date.now },
    isMuted: { type: Boolean, default: false },
    isCamOff: { type: Boolean, default: false },
  }],
  isActive: { type: Boolean, default: true },
  expiresAt: { type: Date, default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) },
}, { timestamps: true });

roomSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Room', roomSchema);
EOF

# ── src/models/Meeting.model.js ──
cat > src/models/Meeting.model.js << 'EOF'
const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema({
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  roomId: { type: String, required: true },
  host: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, default: 'Samvaad Meeting' },
  participants: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    joinedAt: { type: Date },
    leftAt: { type: Date },
    duration: { type: Number, default: 0 },
  }],
  messages: [{
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    senderName: { type: String },
    text: { type: String },
    sentAt: { type: Date, default: Date.now },
  }],
  startedAt: { type: Date, default: Date.now },
  endedAt: { type: Date, default: null },
  duration: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'ended'], default: 'active' },
}, { timestamps: true });

module.exports = mongoose.model('Meeting', meetingSchema);
EOF

# ── src/middleware/auth.middleware.js ──
cat > src/middleware/auth.middleware.js << 'EOF'
const { verifyToken } = require('../utils/jwt');
const { error } = require('../utils/response');
const User = require('../models/User.model');

const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return error(res, 'Unauthorized — no token', 401);
  try {
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) return error(res, 'User not found', 401);
    next();
  } catch {
    return error(res, 'Invalid or expired token', 401);
  }
};

module.exports = { protect };
EOF

# ── src/middleware/error.middleware.js ──
cat > src/middleware/error.middleware.js << 'EOF'
const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  logger.error(err.message);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = { errorHandler };
EOF

# ── src/middleware/validate.middleware.js ──
cat > src/middleware/validate.middleware.js << 'EOF'
const { validationResult } = require('express-validator');
const { error } = require('../utils/response');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return error(res, errors.array()[0].msg, 422);
  next();
};

module.exports = { validate };
EOF

# ── src/middleware/rateLimit.middleware.js ──
cat > src/middleware/rateLimit.middleware.js << 'EOF'
const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many requests, please try again later.' },
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: { success: false, message: 'Rate limit exceeded.' },
});

module.exports = { authLimiter, apiLimiter };
EOF

# ── src/services/auth.service.js ──
cat > src/services/auth.service.js << 'EOF'
const User = require('../models/User.model');
const { signToken, signRefreshToken } = require('../utils/jwt');

const register = async ({ name, email, password }) => {
  const existing = await User.findOne({ email });
  if (existing) throw Object.assign(new Error('Email already in use'), { statusCode: 409 });
  const user = await User.create({ name, email, password });
  const token = signToken({ id: user._id });
  const refreshToken = signRefreshToken({ id: user._id });
  return { user: user.toSafeObject(), token, refreshToken };
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw Object.assign(new Error('Invalid email or password'), { statusCode: 401 });
  }
  user.lastSeen = new Date();
  await user.save({ validateBeforeSave: false });
  const token = signToken({ id: user._id });
  const refreshToken = signRefreshToken({ id: user._id });
  return { user: user.toSafeObject(), token, refreshToken };
};

module.exports = { register, login };
EOF

# ── src/services/room.service.js ──
cat > src/services/room.service.js << 'EOF'
const { nanoid } = require('nanoid');
const Room = require('../models/Room.model');
const Meeting = require('../models/Meeting.model');

const createRoom = async ({ name, hostId, password, waitingRoom }) => {
  const roomId = nanoid(10);
  const room = await Room.create({ roomId, name, host: hostId, password, waitingRoom });
  const meeting = await Meeting.create({ room: room._id, roomId, host: hostId, title: name });
  return { room, meeting };
};

const getRoom = async (roomId) => {
  const room = await Room.findOne({ roomId, isActive: true }).populate('host', 'name avatar');
  if (!room) throw Object.assign(new Error('Room not found'), { statusCode: 404 });
  return room;
};

const joinRoom = async (roomId, userId) => {
  const room = await Room.findOne({ roomId, isActive: true });
  if (!room) throw Object.assign(new Error('Room not found'), { statusCode: 404 });
  const alreadyIn = room.activeParticipants.some(p => p.user.toString() === userId);
  if (!alreadyIn) {
    room.activeParticipants.push({ user: userId });
    await room.save();
  }
  return room;
};

const leaveRoom = async (roomId, userId) => {
  const room = await Room.findOne({ roomId });
  if (!room) return;
  room.activeParticipants = room.activeParticipants.filter(
    p => p.user.toString() !== userId
  );
  await room.save();
  return room;
};

const endRoom = async (roomId, hostId) => {
  const room = await Room.findOneAndUpdate(
    { roomId, host: hostId },
    { isActive: false, activeParticipants: [] },
    { new: true }
  );
  if (!room) throw Object.assign(new Error('Room not found or not host'), { statusCode: 403 });
  await Meeting.findOneAndUpdate(
    { roomId, status: 'active' },
    { endedAt: new Date(), status: 'ended' }
  );
  return room;
};

module.exports = { createRoom, getRoom, joinRoom, leaveRoom, endRoom };
EOF

# ── src/services/meeting.service.js ──
cat > src/services/meeting.service.js << 'EOF'
const Meeting = require('../models/Meeting.model');

const getMeetingsByUser = async (userId) => {
  return Meeting.find({ 'participants.user': userId })
    .sort({ createdAt: -1 })
    .limit(20)
    .populate('host', 'name avatar');
};

module.exports = { getMeetingsByUser };
EOF

# ── src/services/email.service.js ──
cat > src/services/email.service.js << 'EOF'
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

const sendEmail = async ({ to, subject, html }) => {
  await transporter.sendMail({ from: `Samvaad <${process.env.SMTP_USER}>`, to, subject, html });
};

module.exports = { sendEmail };
EOF

# ── src/controllers/auth.controller.js ──
cat > src/controllers/auth.controller.js << 'EOF'
const { register, login } = require('../services/auth.service');
const { success } = require('../utils/response');

exports.register = async (req, res, next) => {
  try {
    const data = await register(req.body);
    success(res, data, 'Account created successfully', 201);
  } catch (err) { next(err); }
};

exports.login = async (req, res, next) => {
  try {
    const data = await login(req.body);
    success(res, data, 'Login successful');
  } catch (err) { next(err); }
};

exports.me = async (req, res) => {
  success(res, { user: req.user });
};

exports.logout = async (req, res) => {
  success(res, {}, 'Logged out successfully');
};
EOF

# ── src/controllers/room.controller.js ──
cat > src/controllers/room.controller.js << 'EOF'
const roomService = require('../services/room.service');
const { success } = require('../utils/response');

exports.createRoom = async (req, res, next) => {
  try {
    const data = await roomService.createRoom({ ...req.body, hostId: req.user._id });
    success(res, data, 'Room created', 201);
  } catch (err) { next(err); }
};

exports.getRoom = async (req, res, next) => {
  try {
    const room = await roomService.getRoom(req.params.roomId);
    success(res, { room });
  } catch (err) { next(err); }
};

exports.joinRoom = async (req, res, next) => {
  try {
    const room = await roomService.joinRoom(req.params.roomId, req.user._id);
    success(res, { room });
  } catch (err) { next(err); }
};

exports.leaveRoom = async (req, res, next) => {
  try {
    await roomService.leaveRoom(req.params.roomId, req.user._id);
    success(res, {}, 'Left room');
  } catch (err) { next(err); }
};

exports.endRoom = async (req, res, next) => {
  try {
    await roomService.endRoom(req.params.roomId, req.user._id);
    success(res, {}, 'Room ended');
  } catch (err) { next(err); }
};
EOF

# ── src/controllers/meeting.controller.js ──
cat > src/controllers/meeting.controller.js << 'EOF'
const Meeting = require('../models/Meeting.model');
const { success } = require('../utils/response');

exports.getMyMeetings = async (req, res, next) => {
  try {
    const meetings = await Meeting.find({ 'participants.user': req.user._id })
      .sort({ createdAt: -1 }).limit(20).populate('host', 'name avatar');
    success(res, { meetings });
  } catch (err) { next(err); }
};

exports.getMeetingById = async (req, res, next) => {
  try {
    const meeting = await Meeting.findById(req.params.id)
      .populate('participants.user', 'name avatar')
      .populate('host', 'name avatar');
    if (!meeting) return next(Object.assign(new Error('Meeting not found'), { statusCode: 404 }));
    success(res, { meeting });
  } catch (err) { next(err); }
};
EOF

# ── src/controllers/user.controller.js ──
cat > src/controllers/user.controller.js << 'EOF'
const User = require('../models/User.model');
const { success } = require('../utils/response');

exports.getProfile = async (req, res) => {
  success(res, { user: req.user });
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id, { name, avatar }, { new: true, runValidators: true }
    );
    success(res, { user: user.toSafeObject() });
  } catch (err) { next(err); }
};
EOF

# ── src/routes/index.js ──
cat > src/routes/index.js << 'EOF'
const router = require('express').Router();
const { apiLimiter } = require('../middleware/rateLimit.middleware');

router.use(apiLimiter);
router.use('/auth', require('./auth.routes'));
router.use('/rooms', require('./room.routes'));
router.use('/meetings', require('./meeting.routes'));
router.use('/users', require('./user.routes'));

module.exports = router;
EOF

# ── src/routes/auth.routes.js ──
cat > src/routes/auth.routes.js << 'EOF'
const router = require('express').Router();
const { body } = require('express-validator');
const { register, login, me, logout } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const { authLimiter } = require('../middleware/rateLimit.middleware');

router.post('/register', authLimiter, [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password min 6 chars'),
], validate, register);

router.post('/login', authLimiter, [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required'),
], validate, login);

router.get('/me', protect, me);
router.post('/logout', protect, logout);

module.exports = router;
EOF

# ── src/routes/room.routes.js ──
cat > src/routes/room.routes.js << 'EOF'
const router = require('express').Router();
const { createRoom, getRoom, joinRoom, leaveRoom, endRoom } = require('../controllers/room.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);
router.post('/', createRoom);
router.get('/:roomId', getRoom);
router.post('/:roomId/join', joinRoom);
router.post('/:roomId/leave', leaveRoom);
router.delete('/:roomId', endRoom);

module.exports = router;
EOF

# ── src/routes/meeting.routes.js ──
cat > src/routes/meeting.routes.js << 'EOF'
const router = require('express').Router();
const { getMyMeetings, getMeetingById } = require('../controllers/meeting.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);
router.get('/', getMyMeetings);
router.get('/:id', getMeetingById);

module.exports = router;
EOF

# ── src/routes/user.routes.js ──
cat > src/routes/user.routes.js << 'EOF'
const router = require('express').Router();
const { getProfile, updateProfile } = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);
router.get('/profile', getProfile);
router.patch('/profile', updateProfile);

module.exports = router;
EOF

# ── src/socket/index.js ──
cat > src/socket/index.js << 'EOF'
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
EOF

# ── src/socket/room.socket.js ──
cat > src/socket/room.socket.js << 'EOF'
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
EOF

# ── src/socket/chat.socket.js ──
cat > src/socket/chat.socket.js << 'EOF'
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
EOF

# ── .env.example ──
cat > .env.example << 'EOF'
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/samvaad
JWT_SECRET=your_super_secret_jwt_key_here
JWT_REFRESH_SECRET=your_super_secret_refresh_key_here
JWT_EXPIRES_IN=7d
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your_app_password
EOF

# ── .gitignore ──
cat > .gitignore << 'EOF'
node_modules/
.env
logs/
.DS_Store
EOF

echo ""
echo "✅ All files created!"
echo ""
echo "Next steps:"
echo "  1. Add your .env file with MONGO_URI, JWT_SECRET, JWT_REFRESH_SECRET"
echo "  2. Run: npm install"
echo "  3. Run: npm run dev"
echo "  4. Visit: http://localhost:5000/health"
echo ""

