// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author:
// ID:

import mongoose from 'mongoose';
import CartItem, { ICartItem } from '../models/CartItem';
import { OrderStatus } from '../models/OrderStatus';
import OrderItem from '../models/OrderItem';
import Order from '../models/Order';
import { orderBilling } from '../utils/OrderBilling';
import { getTotalPrice } from '../utils/TotalPrice';
import { ProductModel, IProduct } from '../models/Product';
import { chooseHub } from './HubService';
import { splitOrder } from '../utils/SplitOrder';
import { FilterQuery, SortOrder } from 'mongoose';
import { VendorModel } from '../models/Vendor';

type ProductFilters = {
  minPrice?: number | null;
  maxPrice?: number | null;
  category?: string | null;
  keyword?: string | null;
  vendor?: string | null;
};

type ProductPaging = {
  page: number;
  pageSize: number;
};

type ProductSorting = {
  priceOrder?: 'asc' | 'desc' | null; // only price sorting
};

export const getProducts = async (
  filters: ProductFilters = {},
  paging: ProductPaging = { page: 1, pageSize: 4 },
  sorting: ProductSorting = { priceOrder: null },
) => {
  const query: FilterQuery<IProduct> = {};

  if (filters.minPrice != null || filters.maxPrice != null) {
    query.price = {};
    if (filters.minPrice != null) query.price.$gte = filters.minPrice;
    if (filters.maxPrice != null) query.price.$lte = filters.maxPrice;
  }

  if (filters.category) {
    query.category = filters.category;
  }

  if (filters.keyword) {
    query.name = { $regex: filters.keyword, $options: 'i' };
  }

  if (filters.vendor) {
    query.vendor = filters.vendor;
  }

  const sort: Record<string, SortOrder> = {};
  if (sorting.priceOrder === 'asc') sort.price = 1;
  if (sorting.priceOrder === 'desc') sort.price = -1;

  const skip = (paging.page - 1) * paging.pageSize;

  const tasks: Promise<any>[] = [
    ProductModel.find(query)
      .sort(sort)
      .skip(skip)
      .limit(paging.pageSize)
      .lean(),
    ProductModel.countDocuments(query),
  ];

  // If vendor filter exists, also fetch vendor
  if (filters.vendor) {
    tasks.push(
      VendorModel.findById(filters.vendor)
        .select('-password -role -_t -_v')
        .lean(),
    );
  }

  const results = await Promise.all(tasks);

  const items = results[0] as IProduct[];
  const total = results[1] as number;

  // validate items and total
  if (!items || typeof total !== 'number') {
    return null;
  }

  // vendor validation
  let vendor: any = null;
  if (filters.vendor) {
    vendor = results[2] || null;
    if (!vendor) {
      return null;
    }
  }

  return {
    products: items,
    totalProducts: total,
    pageIndex: paging.page,
    pageSize: paging.pageSize,
    totalPages: Math.max(1, Math.ceil(total / paging.pageSize)),
    ...(vendor ? { vendor } : {}),
  };
};

export const getOneProduct = async (productId: string) => {
  // 1) fetch product
  const product = await ProductModel.findById(productId).lean();
  if (!product) {
    return null;
  }

  // 2) fetch vendor if vendorId exists
  let vendor = null;
  const vendorId = product.vendor;

  if (vendorId) {
    vendor = await VendorModel.findById(vendorId)
      .select('-password -role -__t -__v')
      .lean();
    if (!vendor) {
      return null;
    }
  }

  return {
    product,
    vendor,
  };
};

export const getCustomerCart = async (userId: string) => {
  return CartItem.find({ customer: userId })
    .populate({ path: 'product', model: ProductModel })
    .exec();
};

export const getCustomerCartByObjectId = async (userId: string) => {
  return CartItem.find({ customer: userId });
};
export const deleteItemByProduct = async (
  userId: string,
  productId: string,
) => {
  console.log(`check in deleteItem by product: ${userId} + ${productId}`);
  return CartItem.findOneAndDelete({ customer: userId, _id: productId });
};

export const deleteAllItem = async (userId: string) => {
  return CartItem.deleteMany({ customer: userId });
};

export const addItemToCart = async ({
  customer,
  product,
  quantity,
}: {
  customer: string;
  product: string;
  quantity: number;
}) => {
  const item = await CartItem.findOne({ customer, product });
  console.log('Checking cart item:', { customer, product });

  // cong them quantity
  if (item) {
    item.quantity += quantity;
    return item.save();
  }

  return CartItem.create({ customer, product, quantity });
};

export const modifyItemCart = async ({
  customerId,
  itemId,
  quantity,
}: {
  customerId: string;
  itemId: string;
  quantity: number;
}) => {
  // 1. Check product stock
  const cartItem = await CartItem.findOne({ product: itemId });
  const productItem = await ProductModel.findOne({ _id: itemId });
  // console.log('cartItem in update: '+JSON.stringify(cartItem));
  if (!productItem || !cartItem) {
    throw new Error('Product not found');
  }

  if (quantity > productItem.availableStock) {
    throw new Error(
      `Requested quantity (${quantity}) exceeds available stock (${productItem.availableStock}).`,
    );
  }

  // 2. Update cart item
  const updatedCartItem = await CartItem.findOneAndUpdate(
    { customer: customerId, _id: cartItem._id },
    { $set: { quantity } },
    { new: true, upsert: true }, // upsert allows creating item if not exists
  ).populate('product');

  // 3. Return both product stock + cart quantity
  return {
    productItem: updatedCartItem,
    availableStock: productItem.availableStock,
    quantity: updatedCartItem?.quantity,
  };
  return 0;
};

export const createOrderFromItem = async (userId: string) => {
  const customer = userId;
  const orderDate = new Date();
  const status = OrderStatus.PENDING;
  const hub = await chooseHub();
  const cartItem = await getCustomerCart(userId);


  console.log('Cart items for order creation:', cartItem);

  const orders = await splitOrder(cartItem);
  console.log('Split orders by vendor:', orders);

  if (!checkStock(cartItem)) {
    return null;
  }

  const createdOrders = [];

  for (const [vendorId, order] of orders) {
    try {
      const miniOrder = await Order.create({
        customer,
        orderDate,
        status,
        totalPrice: 0,
        distributionHub: hub,
      });
      console.log('Minited order:', miniOrder);

      const orderItems = orderBilling(order, miniOrder);
      console.log('Order items:', orderItems);
      const totalPrice = getTotalPrice(orderItems);
      miniOrder.totalPrice = totalPrice;
      await miniOrder.save();

      await OrderItem.insertMany(orderItems);
      createdOrders.push(miniOrder);
    } catch (err) {
      console.error('Failed to create order for vendor', vendorId, err);
      throw new Error('Order item failed');
    }
  }
  const bulkOps = cartItem.map(item => ({
    updateOne: {
      filter: { _id: item.product },
      update: { $inc: { availableStock: -item.quantity } }
    }
  }));
  console.log('Bulk operations for stock update:', bulkOps);
await ProductModel.bulkWrite(bulkOps);

  const bulkOps = cartItem.map((item) => ({
    updateOne: {
      filter: { _id: item.product },
      update: { $inc: { availableStock: -item.quantity } },
    },
  }));
  console.log('Bulk operations for stock update:', bulkOps);
  await ProductModel.bulkWrite(bulkOps);

  // Clear all item in the cart
  await deleteAllItem(userId);
  return { orders: createdOrders };
};

// Check quantity of the product from vendor, replace the 0 by later
// Question on the query of the product's quantity from the shop, which route to be more efficient
export const checkStock = (items: ICartItem[]): boolean => {
  const ans = items.every((e) => e.quantity > 0);
  return ans;
};
