import { Schema, model } from 'mongoose';
import { IUser } from './User';
import { UserRole } from './UserRole';

export interface IShipper extends IUser {
  profilePicture: string;
  assignedHub: Schema.Types.ObjectId; // Required for shippers
  role: UserRole.SHIPPER;
}

const shipperSchema = new Schema<IShipper>(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: true },
    role: {
      type: String,
      enum: [UserRole.SHIPPER],
      default: UserRole.SHIPPER,
      required: true,
    },

    // Shipper-specific fields
    assignedHub: {
      type: Schema.Types.ObjectId,
      ref: 'DistributionHub',
      required: true,
    },
    profilePicture: { type: String, required: true },
  },
  {
    timestamps: true,
  },
);

// Indexes for performance
shipperSchema.index({ username: 1 });
shipperSchema.index({ assignedHub: 1 });

export default model<IShipper>('Shipper', shipperSchema);
