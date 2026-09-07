import mongoose, { Schema, Document } from 'mongoose';
import { compressToWebp } from '../utils/imageCompressor';

export interface IAnnouncement extends Document {
  title: string;
  shortDescription: string;
  content: string;
  image?: string;
  status: 'DRAFT' | 'PUBLISHED';
  createdAt: Date;
  updatedAt: Date;
}

const AnnouncementSchema: Schema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    shortDescription: { type: String, required: true },
    content: { type: String, required: true },
    image: { type: String, default: '' },
    status: { type: String, enum: ['DRAFT', 'PUBLISHED'], default: 'PUBLISHED', index: true },
  },
  { timestamps: true }
);

AnnouncementSchema.pre('save', async function (this: any, next) {
  try {
    if (this.isModified('image') && this.image) {
      this.image = await compressToWebp(this.image);
    }
    next();
  } catch (err: any) {
    next(err);
  }
});

AnnouncementSchema.pre('findOneAndUpdate', async function (next) {
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

export const Announcement = mongoose.model<IAnnouncement>('Announcement', AnnouncementSchema);
