import { ProductModel } from '../models/Product';

export const productQuantity =  (productId: string) => {
  const productQuantity =
     ProductModel.findById(productId).select('quantity');
  return productQuantity;
};
