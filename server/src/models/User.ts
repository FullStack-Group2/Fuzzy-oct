// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author: 
// ID: 

import { Schema, model, Document } from 'mongoose';
import { UserRole } from './UserRole';

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  role: UserRole;
  profilePicture: string;
}

const userSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: Object.values(UserRole), required: true },
    profilePicture: { type: String, required: false },
  },
  { timestamps: true },
);

export const UserModel = model<IUser>('User', userSchema);
