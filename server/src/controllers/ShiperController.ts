import { Request, Response } from 'express';

import { ShipperModel } from '../models/Shipper';

// Get shipper with profile picture
export const getShipperById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const shipper = await ShipperModel.findById(id).select('-password');
    if (!shipper) {
      return res.status(404).json({ message: 'Shipper not found.' });
    }

    res.status(200).json({
      shipper: {
        id: shipper._id,
        username: shipper.username,
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
}