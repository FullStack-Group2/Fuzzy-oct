import { Schema, model, Document } from 'mongoose';
import { UserRole } from './UserRole';

export interface IUser extends Document {
  username: string;
  password: string;
  role: UserRole;
  profilePicture: string; 
}

const userSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: Object.values(UserRole), required: true },
  profilePicture: { type: String, required: false },
}, { discriminatorKey: 'role', timestamps: true });

export const UserModel = model<IUser>('User', userSchema);
