// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author:
// ID:

import { IOrderItem } from '../models/OrderItem';

// export const getTotalPrice = (orderItems: IOrderItem[]): number => {
//   return orderItems.reduce((total, e) => total + e.priceAtPurchase, 0);
// };

export const getTotalPrice = (orderItems: IOrderItem[]): number => {
  const total = orderItems.reduce((sum, item) => {
    const price = Number(item.priceAtPurchase ?? 0); // unit price
    const qty = Number((item as any).quantity ?? 1);
    return sum + price * qty;
  }, 0);

  return Math.round(total * 100) / 100; 
};
