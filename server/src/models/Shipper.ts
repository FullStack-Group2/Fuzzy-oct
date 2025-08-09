// models/Shipper.ts
import { Schema, Types } from 'mongoose';
import { UserModel, IUser } from './User';
import { UserRole } from './UserRole';

export interface IShipper extends IUser {
  assignedHub: Types.ObjectId;
}

const shipperSchema = new Schema<IShipper>({
  assignedHub: {
    type: Schema.Types.ObjectId,
    ref: 'DistributionHub',
    required: true,
  },
});

export const ShipperModel = UserModel.discriminator<IShipper>(
  UserRole.SHIPPER,
  shipperSchema,
);
