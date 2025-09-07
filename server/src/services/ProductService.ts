// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author: 
// ID: 

import { ProductModel } from '../models/Product';

export const productQuantity =  (productId: string) => {
  const productQuantity =
     ProductModel.findById(productId).select('quantity');
  return productQuantity;
};
