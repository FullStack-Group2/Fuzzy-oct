import { Request, Response } from 'express';
import { VendorModel } from '../models/Vendor';
import { UserServices } from '../services/UserServices';

// Get vendor with profile picture
export const getVendorById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const vendor = await VendorModel.findById(id).select('-password');
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found.' });
    }

    res.status(200).json({
      vendor: {
        id: vendor._id,
        username: vendor.username,
        role: vendor.role,
        businessName: vendor.businessName,
        businessAddress: vendor.businessAddress,
        profilePicture: vendor.profilePicture,
      },
    });
  } catch (error) {
    console.error('Error fetching vendor:', error);
    res.status(500).json({
      message: 'Failed to fetch vendor.',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const updateVendor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { username, businessName, businessAddress, ...updateData } = req.body;

    // Check username uniqueness
    if (username) {
      const existingUser = await UserServices.usernameExists(username);
      if (existingUser) {
        return res.status(409).json({ message: 'Username already exists.' });
      }
      updateData.username = username;
    }

    // Check businessName uniqueness
    if (businessName) {
      const existingVendor = await VendorModel.findOne({ businessName });
      if (existingVendor && existingVendor.id.toString() !== id) {
        return res
          .status(409)
          .json({ message: 'Business name already exists.' });
      }
      updateData.businessName = businessName;
    }

    // Check businessAddress uniqueness
    if (businessAddress) {
      const existingVendor = await VendorModel.findOne({ businessAddress });
      if (existingVendor && existingVendor.id.toString() !== id) {
        return res
          .status(409)
          .json({ message: 'Business address already exists.' });
      }
      updateData.businessAddress = businessAddress;
    }

    // ✅ Update vendor
    const vendor = await VendorModel.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).select('-password');

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found.' });
    }

    res.status(200).json({
      vendor: {
        id: vendor._id,
        username: vendor.username,
        businessName: vendor.businessName,
        businessAddress: vendor.businessAddress,
      },
    });
  } catch (error) {
    console.error('Error updating vendor:', error);
    res.status(500).json({
      message: 'Failed to update vendor.',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
