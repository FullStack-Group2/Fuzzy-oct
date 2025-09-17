// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author: Pham Le Gia Huy
// ID: s3975371

import { Schema, model, Document } from 'mongoose';

export interface IOrderItem extends Document {
  order: Schema.Types.ObjectId;
  product: Schema.Types.ObjectId;
  quantity: number;
  priceAtPurchase: number;
}

const OrderItemSchema = new Schema<IOrderItem>({
  order: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true },
  priceAtPurchase: { type: Number, required: true },
});

export default model<IOrderItem>('OrderItem', OrderItemSchema);
