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
