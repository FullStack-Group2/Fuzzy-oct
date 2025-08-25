import { IOrderItem } from "../models/OrderItem";

export const getTotalPrice = (orderItems: IOrderItem[]): number => {
  return orderItems.reduce((total, e) => total + e.priceAtPurchase, 0);
};
