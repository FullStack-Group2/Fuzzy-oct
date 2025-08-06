import { Schema, model } from 'mongoose';
import { IUser } from './User';
import { UserRole } from './UserRole';

export interface ICustomer extends IUser {
  name: string;
  profilePicture: string;
  role: UserRole.CUSTOMER;
}

const customerSchema = new Schema<ICustomer>({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: [UserRole.CUSTOMER], default: UserRole.CUSTOMER, required: true },

  
  // Customer-specific fields
  name: { type: String, required: true },
  profilePicture: { type: String, required: false }
}, {
  timestamps: true
});

// Indexes for performance
customerSchema.index({ username: 1 });
customerSchema.index({ name: 1 });

export default model<ICustomer>('Customer', customerSchema);
