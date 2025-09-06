// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author: 
// ID: 

import { Schema } from 'mongoose';
import { UserModel, IUser } from './User';
import { UserRole } from './UserRole';

export interface ICustomer extends IUser {
  name: string;
  address: string;
}

const customerSchema = new Schema<ICustomer>({
  name: { type: String, required: true },
  address: { type: String, required: true },
});

export const CustomerModel = UserModel.discriminator<ICustomer>(
  UserRole.CUSTOMER,
  customerSchema,
);
