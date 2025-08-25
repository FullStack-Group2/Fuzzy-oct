import mongoose from 'mongoose';
import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { VendorModel } from '../models/Vendor';
import { IProduct } from '../models/Product';
import {
  createProduct,
  getOneProduct,
  getVendorProducts,
  editProduct,
  deleteProduct,
  getVendorOrders,
  getVendorOrderHistory,
  getProductSalesCount,
} from '../services/VendorService';

// Get vendor with profile picture
export const getVendorById = async (req: Request, res: Response) => {
  try {
    const { vendorId } = req.params;

    const vendor = await VendorModel.findById(vendorId).select('-password');
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found.' });
    }

    res.status(200).json({
      vendor: {
        id: vendor._id,
        username: vendor.username,
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

// Add a new product
export const addProduct = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId } = req.user!;
    const { name, price, description, imageUrl } = req.body;

    // Validate required fields
    if (!name || !description || !price) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // Create new product
    const newProduct = await createProduct({
      name: name.trim(),
      price,
      description: description.trim(),
      imageUrl: imageUrl.trim(),
      vendor: new mongoose.Types.ObjectId(userId),
    });

    res
      .status(201)
      .json({ message: 'Product added successfully.', product: newProduct });
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({
      message: 'Failed to add product.',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Get all vendor's products
export const getAllProducts = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const { userId } = req.user!;
    const products = await getVendorProducts(userId);
    res.status(200).json({ products });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      message: 'Failed to fetch products.',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const editProductDetails = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const { userId } = req.user!;
    const { productId } = req.params;
    const updateData = req.body;

    // Owner validate
    const products: IProduct[] = await getVendorProducts(userId);
    const targetProduct = products.find((p) => p._id.toString() === productId);

    if (!targetProduct) {
      return res
        .status(404)
        .json({ message: 'Product not found or access denied.' });
    }

    // Update the product
    const updatedProduct = await editProduct(productId, updateData);
    res.status(200).json({
      message: 'Product updated successfully.',
      product: updatedProduct,
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({
      message: 'Failed to update product.',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const deleteOneProduct = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const { userId } = req.user!;
    const { productId } = req.params;

    // Owner validate
    const products: IProduct[] = await getVendorProducts(userId);
    const targetProduct = products.find((p) => p._id.toString() === productId);

    if (!targetProduct) {
      return res
        .status(404)
        .json({ message: 'Product not found or access denied.' });
    }

    await deleteProduct(productId);
    res.status(200).json({ message: 'Product deleted successfully.' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      message: 'Failed to delete product.',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const getActiveOrders = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const { vendorId } = req.params;
    const orders = await getVendorOrders(vendorId);
    res
      .status(200)
      .json({ message: 'Active orders fetched successfully.', orders });
  } catch (error) {
    console.error('Error fetching active orders:', error);
    res.status(500).json({
      message: 'Failed to fetch active orders.',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const getOrderHistory = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const { vendorId } = req.params;
    const orders = await getVendorOrderHistory(vendorId);
    res
      .status(200)
      .json({ message: 'Past orders fetched successfully.', orders });
  } catch (error) {
    console.error('Error fetching past orders:', error);
    res.status(500).json({
      message: 'Failed to fetch past orders.',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const getProductSales = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const { productId } = req.params;
    const totalSold = await getProductSalesCount(productId);
    res
      .status(200)
      .json({ message: 'Product sales fetched successfully.', totalSold });
  } catch (error) {
    console.error('Error fetching product sales:', error);
    res.status(500).json({
      message: 'Failed to fetch product sales.',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const getProduct = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { productId } = req.params;
    const product = await getOneProduct(productId);
    res.status(200).json({ message: 'Product fetched successfully', product });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      message: 'Failed to fetch product.',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const productInventoryDecrease = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { productId } = req.params;
    const { amount } = req.body;
    const parsedAmount = Number(amount);

    console.log(parsedAmount)
    
    if (isNaN(parsedAmount)) {
      return res.status(400).json({ message: 'Invalid amount provided.' });
    }

    if (!productId || !amount) {
      return res.status(400).json({ message: 'Product ID and amount are required.' });
    }

    const product = await getOneProduct(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    if (product.availableStock < amount) {
      return res.status(400).json({ message: 'Insufficient inventory.' });
    }

    const updatedProduct = await editProduct(productId, {
      availableStock: product.availableStock - amount,
    });

    res.status(200).json({
      message: 'Product inventory decreased successfully.',
      product: updatedProduct,
    });
  } catch (error) {
    console.error('Error decreasing product inventory:', error);
    res.status(500).json({
      message: 'Failed to decrease product inventory.',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};