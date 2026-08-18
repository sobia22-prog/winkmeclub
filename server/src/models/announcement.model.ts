import mongoose, { Schema, Document } from 'mongoose';

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

export const Announcement = mongoose.model<IAnnouncement>('Announcement', AnnouncementSchema);
