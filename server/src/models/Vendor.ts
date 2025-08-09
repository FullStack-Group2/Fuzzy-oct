import mongoose, { Schema, Document } from 'mongoose';
// Interface to define the properties of a Vendor document
export interface IVendor extends Document {
  username: string;
  password: string; // Password is optional when fetching user data to avoid exposing it
  profilePicture: string;
  businessName: string;
  businessAddress: string;
}

const VendorSchema: Schema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true, // Ensures every username is unique across the collection
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    profilePicture: {
      type: String,
      // for testing purposes, we can make this field optional
      required: false, // Optional field for profile picture URL
      default: '', // Default value if no profile picture is provided
    },
    businessName: {
      type: String,
      required: true,
      unique: true, // Ensures business name is unique among vendors
      trim: true,
    },
    businessAddress: {
      type: String,
      required: true,
      unique: true, // Ensures business address is unique among vendors
      trim: true,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  },
);

export default mongoose.model<IVendor>('Vendor', VendorSchema);
