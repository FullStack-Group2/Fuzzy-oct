// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author:
// ID:

import { Schema, model, Document } from 'mongoose';

export interface ICartItem extends Document {
  customer: Schema.Types.ObjectId;
  product: Schema.Types.ObjectId;
  quantity: number;
}

const CartItemSchema = new Schema<ICartItem>({
  customer: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, default: 0 },
});

export default model<ICartItem>('CartItem', CartItemSchema);
