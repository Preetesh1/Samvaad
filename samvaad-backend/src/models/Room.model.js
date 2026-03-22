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
