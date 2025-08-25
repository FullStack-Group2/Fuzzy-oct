import { Request, Response } from 'express';
import { ICartItem } from '../models/CartItem';
import { CustomerModel } from '../models/Customer';
import { UserServices } from '../services/UserServices';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import {
  addItemToCart,
  createOrderFromItem,
  deleteItemByProduct,
  getCustomerCart,
  getCustomerCartByObjectId,
} from '../services/CustomerServices';
import { Schema } from 'mongoose';

// Get all item in the cart
export const getCart = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // extract request
    const { userId } = req.user!;
    // fetch item from db
    const carts = await getCustomerCart(userId);
    // return
    res.status(200).json({ carts });
  } catch (error) {
    console.error('Error fetching cart item:', error);
    res.status(500).json({
      message: 'Failed to fetch cart item.',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Add item to cart with user id
export const addToCart = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // extract request
    const { itemId, quantity } = req.body;
    const { userId } = req.user!;
    // fetch item from db
    const cartItems = await addItemToCart({
      customer: userId,
      product: itemId,
      quantity,
    });

    // return
    res.status(200).json({ message: 'Product added successfully.', cartItems });
  } catch (error) {
    console.error('Error fetching vendor:', error);
    res.status(500).json({
      message: 'Failed to fetch vendor.',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Create order
export const createOrder = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // extract request
    const { userId } = req.user!;

    // fetch item from db
    const order = await createOrderFromItem(userId);
    // return

    if (!order) {
      res.status(500).json({
        message: 'Not available in stock.',
      });
    }
    res.status(200).json({ message: 'Create order successfully', order });
  } catch (error) {
    console.error('Error fetching vendor:', error);
    res.status(500).json({
      message: 'Failed to fetch vendor.',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// remove item from cart by id
export const removeItemFromCart = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    // extract request
    const { productId } = req.params;
    const { userId } = req.user!;

    // Cart validate

    const cartItems: ICartItem[] = await getCustomerCartByObjectId(userId);
    const targetItem = cartItems.find(
      (p) => (p.product as Schema.Types.ObjectId).toString() === productId,
    );

    if (!targetItem) {
      return res
        .status(404)
        .json({ message: 'Item not found or access denied.' });
    }

    // fetch item from db

    await deleteItemByProduct(userId, productId);

    // return
    res.status(200).json({ message: 'Product deleted successfully.' });
  } catch (error) {
    console.error('Error fetching vendor:', error);
    res.status(500).json({
      message: 'Failed to fetch vendor.',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

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
