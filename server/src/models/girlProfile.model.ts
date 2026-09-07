import mongoose, { Schema, Document } from 'mongoose';
import { compressToWebp } from '../utils/imageCompressor';

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

GirlProfileSchema.index({ isActive: 1, createdAt: -1 });
GirlProfileSchema.index({ categories: 1, isActive: 1 });
GirlProfileSchema.index({ location: 1, isActive: 1 });

GirlProfileSchema.pre('save', async function (this: any, next) {
  try {
    if (this.isModified('profileImage') && this.profileImage) {
      this.profileImage = await compressToWebp(this.profileImage);
    }
    if (this.isModified('galleryImages') && Array.isArray(this.galleryImages) && this.galleryImages.length > 0) {
      this.galleryImages = await Promise.all(
        this.galleryImages.map((img: string) => compressToWebp(img))
      );
    }
    next();
  } catch (err: any) {
    next(err);
  }
});

GirlProfileSchema.pre('findOneAndUpdate', async function (next) {
  try {
    const update: any = this.getUpdate();
    if (!update) return next();

    if (update.profileImage) {
      update.profileImage = await compressToWebp(update.profileImage);
    } else if (update.$set?.profileImage) {
      update.$set.profileImage = await compressToWebp(update.$set.profileImage);
    }

    if (update.galleryImages && Array.isArray(update.galleryImages)) {
      update.galleryImages = await Promise.all(
        update.galleryImages.map((img: string) => compressToWebp(img))
      );
    } else if (update.$set?.galleryImages && Array.isArray(update.$set.galleryImages)) {
      update.$set.galleryImages = await Promise.all(
        update.$set.galleryImages.map((img: string) => compressToWebp(img))
      );
    }

    next();
  } catch (err: any) {
    next(err);
  }
});

export const GirlProfile = mongoose.model<IGirlProfile>('GirlProfile', GirlProfileSchema);
