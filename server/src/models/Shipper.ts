// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author: 
// ID: 

import { Schema, Types } from 'mongoose';
import { UserModel, IUser } from './User';
import { UserRole } from './UserRole';

export interface IShipper extends IUser {
  distributionHub: Types.ObjectId;
}

const shipperSchema = new Schema<IShipper>({
  distributionHub: {
    type: Schema.Types.ObjectId,
    ref: 'DistributionHub',
    required: true,
  },
});

export const ShipperModel = UserModel.discriminator<IShipper>(
  UserRole.SHIPPER,
  shipperSchema,
);
