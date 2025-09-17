// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author: Pham Le Gia Huy
// ID: s3975371

import { ProductModel } from '../models/Product';

export const productQuantity = (productId: string) => {
  const productQuantity = ProductModel.findById(productId).select('quantity');
  return productQuantity;
};
