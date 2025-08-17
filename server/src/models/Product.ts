import { Schema, model, Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  price: number;
  imageUrl: string;
  description: string;
  vendor: Schema.Types.ObjectId; // Reference to the User (Vendor)
}

const ProductSchema = new Schema<IProduct>({
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 200,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  imageUrl: { type: String, required: true },
  description: { type: String, maxlength: 2000 },
  vendor: {
    type: Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true,
  },
});

export default model<IProduct>('Product', ProductSchema);
