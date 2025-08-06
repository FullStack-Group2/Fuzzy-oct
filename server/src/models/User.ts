import { Schema, model, Document } from 'mongoose';
import { UserRole } from './UserRole';

export interface IUser extends Document {
  username: string;
  password: string;
  role:UserRole;
}

const userSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: true },
  role: { type: String, enum: Object.values(UserRole), required: true },
});


export default model<IUser>('User', userSchema);