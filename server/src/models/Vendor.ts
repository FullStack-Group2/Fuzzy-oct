// models/Vendor.ts
import { Schema } from 'mongoose';
import { UserModel, IUser } from './User';
import { UserRole } from './UserRole';

export interface IVendor extends IUser {
  businessName: string;
  businessAddress: string;
}

const vendorSchema = new Schema<IVendor>({
  businessName: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  businessAddress: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
});

export const VendorModel = UserModel.discriminator<IVendor>(
  UserRole.VENDOR,
  vendorSchema,
);
