import mongoose, { Schema, Document } from 'mongoose';

export interface IGirlProfile extends Document {
  name: string;
  rating: number;
  height: string;
  weight: string;
  chestCircumference: string;
  initialLikes: number;
  categories: string[];
  location: string;
  bio: string;
  tags: string[];
  verificationLabel: string;
  details: string;
  profileImage: string;
  galleryImages: string[];
  isFeatured: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const GirlProfileSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    rating: { type: Number, default: 5.0 },
    height: { type: String, default: "5'6\"" },
    weight: { type: String, default: '52 kg' },
    chestCircumference: { type: String, default: '34B' },
    initialLikes: { type: Number, default: 500 },
    categories: [{ type: String }],
    location: { type: String, default: 'Mumbai' },
    bio: { type: String, default: '' },
    tags: [{ type: String }],
    verificationLabel: { type: String, default: 'ID Verified' },
    details: { type: String, default: '' },
    profileImage: { type: String, required: true },
    galleryImages: [{ type: String }],
    isFeatured: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const GirlProfile = mongoose.model<IGirlProfile>('GirlProfile', GirlProfileSchema);
