const Meeting = require('../models/Meeting.model');

const getMeetingsByUser = async (userId) => {
  return Meeting.find({ 'participants.user': userId })
    .sort({ createdAt: -1 })
    .limit(20)
    .populate('host', 'name avatar');
};

module.exports = { getMeetingsByUser };
