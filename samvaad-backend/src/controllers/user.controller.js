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
