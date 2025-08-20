import { Request, Response } from 'express';
import CartItem, { ICartItem } from '../models/CartItem';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import {
  addItemToCart,
  createOrderFromItem,
  deleteItemByProduct,
  getCustomerCart,
} from '../services/CustomerServices';
import { Schema, Types } from 'mongoose';

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
    res
      .status(200)
      .json({ message: 'Item not found or access denied.', order });
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

    const cartItems: ICartItem[] = await getCustomerCart(userId);
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
