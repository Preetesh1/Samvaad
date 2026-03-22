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
