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
