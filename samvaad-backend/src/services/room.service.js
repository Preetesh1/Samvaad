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
