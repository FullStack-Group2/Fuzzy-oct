import { Request, Response } from 'express';
import { CustomerModel } from '../models/Customer';

// Get customer with profile picture
export const getCustomerById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const customer = await CustomerModel.findById(id).select('-password');
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found.' });
    }

    res.status(200).json({
      customer: {
        id: customer._id,
        username: customer.username,
        role: customer.role,
        name: customer.name,
        address: customer.address,
        profilePicture: customer.profilePicture,
      },
    });
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({
      message: 'Failed to fetch customer.',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}