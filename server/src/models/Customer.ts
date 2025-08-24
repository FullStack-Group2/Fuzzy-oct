import { Schema } from 'mongoose';
import { UserModel, IUser } from './User';

export interface ICustomer extends IUser {
  name: string;
  address: string;
}

const customerSchema = new Schema<ICustomer>({
  name: { type: String, required: true },
  address: { type: String, required: true },
});

export const CustomerModel = UserModel.discriminator<ICustomer>(
  "Customer",
  customerSchema,
);