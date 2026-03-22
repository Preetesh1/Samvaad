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
