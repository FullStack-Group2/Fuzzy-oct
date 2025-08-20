import { Request, Response } from 'express';
import { CustomerModel } from '../models/Customer';
import { UserServices } from '../services/UserServices';

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
        email: customer.email,
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
};

export const updateCustomer = async (req: Request, res: Response) => {
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
    const customer = await CustomerModel.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).select('-password');

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found.' });
    }

    res.status(200).json({
      customer: {
        id: customer._id,
        username: customer.username,
        email: customer.email,
        name: customer.name,
        address: customer.address,
      },
    });
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({
      message: 'Failed to update customer.',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
