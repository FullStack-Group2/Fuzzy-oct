import mongoose from 'mongoose';
import CartItem, { ICartItem } from '../models/CartItem';
import { OrderStatus } from '../models/OrderStatus';
import OrderItem from '../models/OrderItem';
import Order from '../models/Order';
import { orderBilling } from '../utils/OrderBilling';
import { getTotalPrice } from '../utils/TotalPrice';
import { ProductModel } from '../models/Product';
import { chooseHub } from './HubService';
import { splitOrder } from '../utils/SplitOrder';
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
  cartId,
  quantity,
}: {
  customerId: string;
  cartId: string;
  quantity: number;
}) => {
  // 1. Check product stock
  const productDoc = await ProductModel.findOne({_id: cartId});
  console.log(productDoc);
  if (!productDoc) {
    throw new Error('Product not found');
  }

  if (quantity > productDoc.availableStock) {
    throw new Error(
      `Requested quantity (${quantity}) exceeds available stock (${productDoc.availableStock}).`,
    );
  }

  // 2. Update cart item
  const updatedCartItem = await CartItem.findOneAndUpdate(
    { customer: customerId, _id: cartId },
    { $set: { quantity } },
    { new: true, upsert: true }, // upsert allows creating item if not exists
  ).populate('product');

  // 3. Return both product stock + cart quantity
  return {
    cartItem: updatedCartItem,
    availableStock: productDoc.availableStock,
    quantity: updatedCartItem?.quantity,
  };
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

export const getCustomerProducts = async () => {
  return ProductModel.find({});
};

export const getStoreProducts = async (storeId: string) => {
  return ProductModel.find({ vendor: storeId });
};
