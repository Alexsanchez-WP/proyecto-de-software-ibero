import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  images: string[];
  stock: number;
  brand: string;
  color: string;
  dimensions: string;
  created_at: Date;
}

const ProductSchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  images: { type: [String], required: true },
  stock: { type: Number, required: true },
  brand: { type: String, required: true },
  color: { type: String, required: true },
  dimensions: { type: String, required: true },
  created_at: { type: Date, default: Date.now }
});

export const Product = mongoose.model<IProduct>('Product', ProductSchema);
