import mongoose, { Schema, model, Document } from 'mongoose';

export interface IProduct extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  price: number;
  imageUrl: string;
  description: string;
  vendor: mongoose.Types.ObjectId; // Reference to the User (Vendor)
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
  vendor: {
    type: Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true,
  },
});

export default model<IProduct>('Product', ProductSchema);
