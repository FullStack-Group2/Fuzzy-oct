// customer.ts
import { model, Schema, Types } from 'mongoose';
import { UserModel, IUser } from './User';
import { UserRole } from './UserRole';

export interface ICustomer extends IUser {
  user: Types.ObjectId;
  name: string;
  address: string;
}

const customerSchema = new Schema<ICustomer>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  address: { type: String, required: true },
});

export const CustomerModel = model<ICustomer>('Customer', customerSchema);
