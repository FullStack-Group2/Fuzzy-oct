// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author: Pham Le Gia Huy, Le Nguyen Khuong Duy
// ID: s3975371, s4026694

import { ICartItem } from '../models/CartItem';
import { ProductModel } from '../models/Product';

export const splitOrder = async (cartItems: ICartItem[]) => {
  const map = new Map<string, Array<ICartItem>>();

  for (const item of cartItems) {
    const vendorId = (item.product as any).vendor?.toString();

    if (!map.has(vendorId)) {
      map.set(vendorId, []);
    }

    map.get(vendorId)!.push(item);
  }

  return map;
};
