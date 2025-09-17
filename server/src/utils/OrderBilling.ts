// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author: Pham Le Gia Huy
// ID: s3975371

import { ICartItem } from '../models/CartItem';
import { IOrder } from '../models/Order';
import { IOrderItem } from '../models/OrderItem';

export const orderBilling = (
  cartItems: ICartItem[],
  order: IOrder,
): IOrderItem[] => {
  return cartItems.map((e) => ({
    order: order._id,
    product: e.product,
    quantity: e.quantity,
    // priceAtPurchase: (e.product as any).price * e.quantity,

    // priceAtPurchase:
    //   ((e.product as any).sale
    //     ? (e.product as any).price -
    //       ((e.product as any).price * (e.product as any).sale) / 100
    //     : (e.product as any).price) * e.quantity,

    priceAtPurchase: (e.product as any).sale
      ? (e.product as any).price -
        ((e.product as any).price * (e.product as any).sale) / 100
      : (e.product as any).price,
  })) as unknown as IOrderItem[];
};
