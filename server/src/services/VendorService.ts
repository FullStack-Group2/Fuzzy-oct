import { IVendor, VendorModel } from "../models/Vendor";


// Check if a username already exists
export const findVendorByUsername = async (username: string) => {
  return VendorModel.findOne({ username });
};

// Check if a business name already exists
export const findVendorByBusinessName = async (businessName: string) => {
  return VendorModel.findOne({ businessName });
};

// Create a new vendor in the database
export const createVendor = async (vendorData: Partial<IVendor>) => {
  const newVendor = new VendorModel(vendorData);
  await newVendor.save();
  return newVendor;
};
