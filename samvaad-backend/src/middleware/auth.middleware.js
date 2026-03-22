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
