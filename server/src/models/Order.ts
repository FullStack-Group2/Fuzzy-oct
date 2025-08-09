import { Schema, model, Document } from 'mongoose';
import { IOrderItem } from './OrderItem';
import { OrderStatus } from './OrderStatus';

export interface IOrder extends Document {
  customer: Schema.Types.ObjectId;
  hub: Schema.Types.ObjectId;
  orderDate: Date;
  status: OrderStatus;
  totalPrice: number;
  orderItems: IOrderItem[]; // This will be a populated virtual field
}

const orderSchema = new Schema<IOrder>(
  {
    customer: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
    hub: {
      type: Schema.Types.ObjectId,
      ref: 'DistributionHub',
      required: true,
    },
    orderDate: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.ACTIVE,
    },
    totalPrice: { type: Number, required: true },
  },
  {
    // Important: Enable virtuals for toJSON and toObject
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// VIRTUAL: Create a virtual property 'orderItems' on the Order schema.
// This allows us to populate the order with its items without storing an array of IDs.
orderSchema.virtual('orderItems', {
  ref: 'OrderItem', // The model to use
  localField: '_id', // Find OrderItems where `localField`
  foreignField: 'order', // matches `foreignField`
});

export default model<IOrder>('Order', orderSchema);
