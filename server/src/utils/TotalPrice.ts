// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author:
// ID:

import { IOrderItem } from '../models/OrderItem';

export const getTotalPrice = (orderItems: IOrderItem[]): number => {
  return orderItems.reduce((total, e) => total + e.priceAtPurchase, 0);
};
