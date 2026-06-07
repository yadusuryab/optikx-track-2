// models/User.ts
import mongoose from 'mongoose';
import { hashPassword } from '../lib/auth';

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

UserSchema.pre('save', function (next) {
  if (this.isModified('password')) {
    this.password = hashPassword(this.password);
  }
  next();
});

export default mongoose.models.User || mongoose.model('User', UserSchema);