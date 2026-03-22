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
