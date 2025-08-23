// models/Shipper.ts
import { Schema, Types, model } from 'mongoose';
import { IUser } from './User';

export interface IShipper extends IUser {
  user: Types.ObjectId;
  distributionHub: Types.ObjectId;
}

const shipperSchema = new Schema<IShipper>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    distributionHub: { type: Schema.Types.ObjectId, ref: "DistributionHub", required: true },
  },
  { timestamps: true }
);


export const ShipperModel = model<IShipper>("Shipper", shipperSchema);