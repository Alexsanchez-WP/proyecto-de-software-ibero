import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  username: string;
  email: string;
  password?: string;
  role: 'admin' | 'user';
  created_at: Date;
}

const UserSchema: Schema = new Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  created_at: { type: Date, default: Date.now }
});

export const User = mongoose.model<IUser>('User', UserSchema);
