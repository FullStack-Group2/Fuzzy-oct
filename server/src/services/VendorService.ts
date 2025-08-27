import { IVendor, VendorModel } from '../models/Vendor';
import Order from '../models/Order';
import { OrderStatus } from '../models/OrderStatus';
import OrderItem from '../models/OrderItem';
import mongoose from 'mongoose';
import { IProduct, ProductModel } from '../models/Product';

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

export const createProduct = async (productData: Partial<IProduct>) => {
  const newProduct = new ProductModel(productData);
  await newProduct.save();
  return newProduct;
};

export const getOneProduct = async (productId: string) => {
  return ProductModel.findById(productId);
};

export const getVendorProducts = async (vendorId: string) => {
  return ProductModel.find({ vendor: vendorId });
};

export const editProduct = async (
  productId: string,
  updateData: Partial<IProduct>,
) => {
  return ProductModel.findByIdAndUpdate(productId, updateData, { new: true });
};

export const deleteProduct = async (productId: string) => {
  return ProductModel.findByIdAndDelete(productId);
};

export const getVendorOrders = async (vendorId: string) => {
  const productIds = await ProductModel.find({ vendor: vendorId }).distinct(
    '_id',
  );

  return Order.aggregate([
    {
      $lookup: {
        from: 'orderitems',
        localField: '_id',
        foreignField: 'order',
        as: 'orderItems',
      },
    },
    {
      $addFields: {
        orderItems: {
          $filter: {
            input: '$orderItems',
            as: 'item',
            cond: { $in: ['$$item.product', productIds] },
          },
        },
      },
    },
    {
      $addFields: {
        totalVendorPrice: {
          $reduce: {
            input: '$orderItems',
            initialValue: 0,
            in: {
              $add: [
                '$$value',
                { $multiply: ['$$this.priceAtPurchase', '$$this.quantity'] },
              ],
            },
          },
        },
      },
    },
    {
      $match: {
        'orderItems.0': { $exists: true }, // Ensure there are orderItems after filtering
        status: OrderStatus.ACTIVE,
      },
    },
  ]);
};

export const getVendorOrderHistory = async (vendorId: string) => {
  const productIds = await ProductModel.find({ vendor: vendorId }).distinct(
    '_id',
  );

  return Order.aggregate([
    {
      $lookup: {
        from: 'orderitems',
        localField: '_id',
        foreignField: 'order',
        as: 'orderItems',
      },
    },
    {
      $addFields: {
        orderItems: {
          $filter: {
            input: '$orderItems',
            as: 'item',
            cond: { $in: ['$$item.product', productIds] },
          },
        },
      },
    },
    {
      $addFields: {
        totalVendorPrice: {
          $reduce: {
            input: '$orderItems',
            initialValue: 0,
            in: {
              $add: [
                '$$value',
                { $multiply: ['$$this.priceAtPurchase', '$$this.quantity'] },
              ],
            },
          },
        },
      },
    },
    {
      $match: {
        'orderItems.0': { $exists: true }, // Ensure there are orderItems after filtering
        status: { $in: [OrderStatus.CANCELED, OrderStatus.DELIVERED] },
      },
    },
  ]);
};

export const getProductSalesCount = async (productId: string) => {
  const result = await OrderItem.aggregate([
    {
      $match: {
        product: new mongoose.Types.ObjectId(productId),
      },
    },
    {
      $group: {
        _id: '$product',
        totalSold: { $sum: '$quantity' },
      },
    },
  ]);

  return result.length > 0 ? result[0].totalSold : 0;
};
