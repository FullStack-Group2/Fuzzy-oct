import mongoose from 'mongoose';
import CartItem, { ICartItem } from '../models/CartItem';
import { OrderStatus } from '../models/OrderStatus';
import OrderItem from '../models/OrderItem';
import Order from '../models/Order';
import { orderBilling } from '../utils/OrderBilling';
import { getTotalPrice } from '../utils/TotalPrice';
import { ProductModel } from '../models/Product';
export const getCustomerCart = async (userId: string) => {
  console.log(mongoose.modelNames());

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
  console.log(`check in deleteItem by product: ${userId} + ${productId}`)
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
      `Requested quantity (${quantity}) exceeds available stock (${productDoc.availableStock}).`
    );
  }

  // 2. Update cart item
  const updatedCartItem = await CartItem.findOneAndUpdate(
    { customer: customerId, _id:cartId },
    { $set: { quantity } },
    { new: true, upsert: true } // upsert allows creating item if not exists
  ).populate('product');

  // 3. Return both product stock + cart quantity
  return {
    cartItem: updatedCartItem,
    availableStock: productDoc.availableStock,
    quantity: updatedCartItem?.quantity,
  };
}

export const createOrderFromItem = async (userId: string) => {
  const customer = userId;
  const orderDate = new Date();
  const status = OrderStatus.PENDING;
  const hub = '68a0a96ad24f3fdeb3eec4a9';

  const cartItem = await getCustomerCart(userId);
  if (checkStock(cartItem)) {
    const order = await Order.create({
      customer,
      orderDate,
      status,
      totalPrice: 0,
      hub,
    });

    const orderItems = orderBilling(cartItem, order);
    const totalPrice = getTotalPrice(orderItems);
    // Lo co hang lay tu hn, co hang lay tu sg thi sao? -> don't need to care
    // order.hub = getHub(cartItem);
    order.totalPrice = totalPrice;
    await order.save();

    // insert
    await OrderItem.insertMany(orderItems);

    // Clear all item in the cart
    await deleteAllItem(userId);

    return order;
  }
  return null;
};

// Check quantity of the product from vendor, replace the 0 by later
// Question on the query of the product's quantity from the shop, which route to be more efficient
export const checkStock = (items: ICartItem[]): boolean => {
  return items.every((e) => e.quantity > 0);
};

// customer co can biet hub nao khong - doc de thi thay co ve la khong
/*
Idea in hub:

Moi city co 3 hub van chuyen, vendor chon hub, khi bam order thi update db hub, update cho customer as followed

Moi item them 1 column la ngay du kien nhan hang, based on the distribution hub the vendor claims

Nut feedback driver/don hang 

lỡ đặt 3 hàng mà shop thiếu hàng thì sao
*/


 export const getCustomerProducts = async () => {
  return ProductModel.find({});
};

 export const getStoreProducts = async (storeId: string) => {
  return ProductModel.find({vendor: storeId});
};