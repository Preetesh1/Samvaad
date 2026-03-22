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
