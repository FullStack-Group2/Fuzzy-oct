// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author: 
// ID: 

import mongoose, { Schema, model, Document } from 'mongoose';
import { ProductCategory } from './ProductCategory';

export interface IProduct extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  price: number;
  imageUrl: string;
  description: string;
  category: ProductCategory;
  vendor: mongoose.Types.ObjectId; // reference to Vendor
  availableStock: number;
}

const ProductSchema = new Schema<IProduct>({
  name: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 20,
  },
  price: {
    type: Number,
    required: true,
    min: 0.01,
  },
  imageUrl: { type: String, required: true },
  description: { type: String, maxlength: 500 },
  category: {
    type: String,
    enum: Object.values(ProductCategory),
    default: ProductCategory.OTHERS,
  },
  vendor: {
    type: Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true,
  },
  availableStock: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
});

export const ProductModel = model<IProduct>('Product', ProductSchema);
