const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, select: false },
  avatar: { type: String, default: null },
  provider: { type: String, enum: ['local', 'google'], default: 'local' },
  providerId: { type: String, default: null },
  isVerified: { type: Boolean, default: false },
  verifyToken: { type: String, default: null },
  resetToken: { type: String, default: null },
  resetTokenExpiry: { type: Date, default: null },
  lastSeen: { type: Date, default: Date.now },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.verifyToken;
  delete obj.resetToken;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
