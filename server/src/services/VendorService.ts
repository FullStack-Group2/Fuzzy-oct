import { IVendor, VendorModel } from '../models/Vendor';
import Product, { IProduct } from '../models/Product';
import Order from '../models/Order';
import { OrderStatus } from '../models/OrderStatus';

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
  const newProduct = new Product(productData);
  await newProduct.save();
  return newProduct;
};

export const getVendorProducts = async (vendorId: string) => {
  return Product.find({ vendor: vendorId });
};

export const editProduct = async (
  productId: string,
  updateData: Partial<IProduct>,
) => {
  return Product.findByIdAndUpdate(productId, updateData, { new: true });
};

export const deleteProduct = async (productId: string) => {
  return Product.findByIdAndDelete(productId);
};

export const getVendorOrders = async (vendorId: string) => {
  const productIds = await Product.find({ vendor: vendorId }).distinct('_id');

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
      $match: {
        'orderItems.product': { $in: productIds },
        status: OrderStatus.ACTIVE,
      },
    },
  ]);
};

export const getVendorOrderHistory = async (vendorId: string) => {
  const productIds = await Product.find({ vendor: vendorId }).distinct('_id');

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
      $match: {
        'orderItems.product': { $in: productIds },
        status: { $in: [OrderStatus.CANCELED, OrderStatus.DELIVERED] },
      },
    },
  ]);
};
