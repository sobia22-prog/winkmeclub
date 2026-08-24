import mongoose, { Schema, Document } from 'mongoose';

export interface IGirlCategory extends Document {
  name: string;
  slug: string;
}

const GirlCategorySchema: Schema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

export const GirlCategory = mongoose.model<IGirlCategory>('GirlCategory', GirlCategorySchema);
