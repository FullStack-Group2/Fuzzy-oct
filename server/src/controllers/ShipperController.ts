import { Request, Response } from 'express';

import { ShipperModel } from '../models/Shipper';
import { UserServices } from '../services/UserServices';

// Get shipper with profile picture
export const getShipperById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const shipper = await ShipperModel.findById(id)
      .select('-password')
      .populate('assignedHub', 'hubName hubLocation');
      
    if (!shipper) {
      return res.status(404).json({ message: 'Shipper not found.' });
    }

    res.status(200).json({
      shipper: {
        id: shipper._id,
        username: shipper.username,
        email: shipper.email,
        role: shipper.role,
        assignedHub: shipper.assignedHub,
        profilePicture: shipper.profilePicture,
      },
    });
  } catch (error) {
    console.error('Error fetching shipper :', error);
    res.status(500).json({
      message: 'Failed to fetch shipper.',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const updateShipper = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { username, ...updateData } = req.body;

    if (username) {
      const existingUser = await UserServices.usernameExists(username);
      if (existingUser) {
        return res.status(409).json({ message: 'Username already exists.' });
      }
      updateData.username = username;
    }

    const shipper = await ShipperModel.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).select('-password');
    if (!shipper) {
      return res.status(404).json({ message: 'Shipper not found.' });
    }
    res.status(200).json({
      shipper: {
        id: shipper._id,
        username: shipper.username,
        email: shipper.email,
      },
    });
  } catch (error) {
    console.error('Error updating shipper:', error);
    res.status(500).json({
      message: 'Failed to update shipper.',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
