import mongoose, { Schema, Document } from 'mongoose';
import { compressToWebp } from '../utils/imageCompressor';

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  sectionType: 'LOBBY' | 'HIDDEN';
  status: 'ACTIVE' | 'INACTIVE';
  stock?: number;
  isMainPage?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, default: 0 },
    image: { type: String, required: true },
    category: { type: String, required: true, default: 'General' },
    sectionType: { type: String, enum: ['LOBBY', 'HIDDEN'], default: 'HIDDEN', index: true },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE', index: true },
    stock: { type: Number, default: 100 },
    isMainPage: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

ProductSchema.pre('save', async function (this: any, next) {
  try {
    if (this.isModified('image') && this.image) {
      this.image = await compressToWebp(this.image);
    }
    next();
  } catch (err: any) {
    next(err);
  }
});

ProductSchema.pre('findOneAndUpdate', async function (next) {
  try {
    const update: any = this.getUpdate();
    if (!update) return next();

    if (update.image) {
      update.image = await compressToWebp(update.image);
    } else if (update.$set?.image) {
      update.$set.image = await compressToWebp(update.$set.image);
    }
    next();
  } catch (err: any) {
    next(err);
  }
});

export const Product = mongoose.model<IProduct>('Product', ProductSchema);
