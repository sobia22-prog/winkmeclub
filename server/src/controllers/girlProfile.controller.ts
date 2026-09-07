import { Request, Response } from 'express';
import { GirlProfile } from '../models/girlProfile.model';
import { GirlCategory } from '../models/girlCategory.model';
import { AuthRequest } from '../middleware/auth.middleware';
import { getCache, setCache, invalidateCache } from '../utils/cache';
import { compressToWebp, isBase64Image } from '../utils/imageCompressor';

const PUBLIC_LIST_FIELDS =
  'name rating height weight chestCircumference initialLikes categories location bio tags verificationLabel details profileImage isFeatured createdAt';

function buildPublicProfilesCacheKey(query: Request['query']): string {
  const category = String(query.category || 'ALL').toLowerCase();
  const city = String(query.city || 'ALL').toLowerCase();
  const search = String(query.search || '').toLowerCase().trim();
  return `public-profiles:${category}:${city}:${search}`;
}

export class GirlProfileController {
  // Get all active profiles (Public for Home & Matches)
  static async getPublicProfiles(req: Request, res: Response) {
    try {
      const cacheKey = buildPublicProfilesCacheKey(req.query);
      const cached = getCache<{ count: number; profiles: unknown[] }>(cacheKey);
      if (cached) {
        res.set('Cache-Control', 'public, max-age=60');
        return res.status(200).json({ success: true, ...cached });
      }

      const { category, city, search } = req.query;
      const query: any = { isActive: true };

      if (category && String(category).trim().toUpperCase() !== 'ALL') {
        const catStr = String(category).trim();
        query.categories = { $in: [new RegExp(`^${catStr}$`, 'i')] };
      }
      if (city && String(city).trim().toUpperCase() !== 'ALL') {
        const cityStr = String(city).trim();
        query.location = new RegExp(cityStr, 'i');
      }
      if (search) {
        const searchStr = String(search).trim();
        query.$or = [
          { name: new RegExp(searchStr, 'i') },
          { bio: new RegExp(searchStr, 'i') },
          { location: new RegExp(searchStr, 'i') },
        ];
      }

      const limit = Math.min(Number(req.query.limit) || 60, 100);
      const page = Math.max(Number(req.query.page) || 1, 1);
      const skip = (page - 1) * limit;

      const profiles = await GirlProfile.find(query)
        .select(PUBLIC_LIST_FIELDS)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec();

      const payload = { count: profiles.length, profiles };
      setCache(cacheKey, payload, 10 * 60 * 1000); // 10 minutes TTL

      res.set('Cache-Control', 'public, max-age=300');
      return res.status(200).json({ success: true, ...payload });
    } catch (error: any) {
      console.error('[GirlProfileController] Error in getPublicProfiles:', error);
      return res.status(500).json({ message: error.message || 'Failed to fetch girl profiles.' });
    }
  }

  // Get profile by ID
  static async getProfileById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const cacheKey = `profile:${id}`;
      const cached = getCache<{ profile: unknown }>(cacheKey);
      if (cached) {
        res.set('Cache-Control', 'public, max-age=120');
        return res.status(200).json({ success: true, ...cached });
      }

      const profile = await GirlProfile.findById(id).lean();
      if (!profile) {
        return res.status(404).json({ message: 'Profile not found.' });
      }

      const payload = { profile };
      setCache(cacheKey, payload, 120_000);
      res.set('Cache-Control', 'public, max-age=120');
      return res.status(200).json({ success: true, ...payload });
    } catch (error: any) {
      return res.status(500).json({ message: error.message || 'Failed to fetch profile details.' });
    }
  }

  // Admin / Staff CRUD - Get all profiles
  static async getAllProfilesAdmin(req: AuthRequest, res: Response) {
    try {
      const profiles = await GirlProfile.find().sort({ createdAt: -1 });
      return res.status(200).json({ success: true, profiles });
    } catch (error: any) {
      return res.status(500).json({ message: error.message || 'Failed to fetch profiles for admin.' });
    }
  }

  // Admin / Staff CRUD - Create Girl Profile
  static async createProfile(req: AuthRequest, res: Response) {
    try {
      const {
        name,
        rating,
        height,
        weight,
        chestCircumference,
        initialLikes,
        categories,
        location,
        bio,
        tags,
        verificationLabel,
        details,
        profileImage,
        galleryImages,
      } = req.body;

      if (!name || !profileImage) {
        return res.status(400).json({ message: 'Name and profile image are required.' });
      }

      const compressedProfileImage = await compressToWebp(profileImage);
      const compressedGalleryImages = Array.isArray(galleryImages)
        ? await Promise.all(galleryImages.map((img: string) => compressToWebp(img)))
        : [];

      const profile = await GirlProfile.create({
        name,
        rating: rating !== undefined ? Number(rating) : 5.0,
        height: height || "5'6\"",
        weight: weight || "52 kg",
        chestCircumference: chestCircumference || "34B",
        initialLikes: initialLikes !== undefined ? Number(initialLikes) : 500,
        categories: Array.isArray(categories) ? categories : [],
        location: location || "Mumbai",
        bio: bio || "",
        tags: Array.isArray(tags) ? tags : typeof tags === 'string' ? tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        verificationLabel: verificationLabel || "ID Verified",
        details: details || "",
        profileImage: compressedProfileImage,
        galleryImages: compressedGalleryImages,
      });

      invalidateCache('public-profiles');

      return res.status(201).json({
        success: true,
        message: 'Girl profile created successfully!',
        profile,
      });
    } catch (error: any) {
      return res.status(500).json({ message: error.message || 'Failed to create girl profile.' });
    }
  }

  // Admin / Staff CRUD - Update Girl Profile
  static async updateProfile(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const updates = req.body;

      if (updates.tags && typeof updates.tags === 'string') {
        updates.tags = updates.tags.split(',').map((t: string) => t.trim()).filter(Boolean);
      }

      if (updates.profileImage) {
        updates.profileImage = await compressToWebp(updates.profileImage);
      }

      if (Array.isArray(updates.galleryImages)) {
        updates.galleryImages = await Promise.all(
          updates.galleryImages.map((img: string) => compressToWebp(img))
        );
      }

      const profile = await GirlProfile.findByIdAndUpdate(id, updates, { new: true });
      if (!profile) {
        return res.status(404).json({ message: 'Profile not found.' });
      }

      invalidateCache('public-profiles');
      invalidateCache(`profile:${id}`);

      return res.status(200).json({
        success: true,
        message: 'Girl profile updated successfully!',
        profile,
      });
    } catch (error: any) {
      return res.status(500).json({ message: error.message || 'Failed to update girl profile.' });
    }
  }

  // Admin / Staff CRUD - Delete Girl Profile
  static async deleteProfile(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      await GirlProfile.findByIdAndDelete(id);
      invalidateCache('public-profiles');
      invalidateCache(`profile:${id}`);
      return res.status(200).json({ success: true, message: 'Girl profile deleted.' });
    } catch (error: any) {
      return res.status(500).json({ message: error.message || 'Failed to delete girl profile.' });
    }
  }

  // Get all Categories (Seeds defaults if empty)
  static async getCategories(req: Request, res: Response) {
    try {
      let categories = await GirlCategory.find().sort({ name: 1 });

      if (categories.length === 0) {
        const defaults = ['Sexy', 'Hot', 'Big Boobs', 'Big Ass'];
        for (const name of defaults) {
          const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
          await GirlCategory.create({ name, slug });
        }
        categories = await GirlCategory.find().sort({ name: 1 });
      }

      return res.status(200).json({ success: true, categories });
    } catch (error: any) {
      return res.status(500).json({ message: error.message || 'Failed to fetch categories.' });
    }
  }

  // Admin / Staff - Add New Category
  static async createCategory(req: AuthRequest, res: Response) {
    try {
      const { name } = req.body;
      if (!name || !name.trim()) {
        return res.status(400).json({ message: 'Category name is required.' });
      }

      const trimmedName = name.trim();
      const slug = trimmedName.toLowerCase().replace(/[^a-z0-9]/g, '-');

      let existing = await GirlCategory.findOne({ slug });
      if (!existing) {
        existing = await GirlCategory.create({ name: trimmedName, slug });
      }

      return res.status(201).json({
        success: true,
        message: 'New category created successfully!',
        category: existing,
      });
    } catch (error: any) {
      return res.status(500).json({ message: error.message || 'Failed to create category.' });
    }
  }

  // Admin - Compress all existing girl profiles in MongoDB to WebP
  static async optimizeDbImages(req: AuthRequest, res: Response) {
    try {
      const profiles = await GirlProfile.find();
      let updatedCount = 0;
      let totalBytesSaved = 0;

      for (const profile of profiles) {
        let changed = false;
        if (profile.profileImage && isBase64Image(profile.profileImage)) {
          const oldLen = profile.profileImage.length;
          const compressed = await compressToWebp(profile.profileImage);
          if (compressed !== profile.profileImage) {
            totalBytesSaved += Math.max(0, oldLen - compressed.length);
            profile.profileImage = compressed;
            changed = true;
          }
        }

        if (Array.isArray(profile.galleryImages) && profile.galleryImages.length > 0) {
          const newGallery: string[] = [];
          for (const img of profile.galleryImages) {
            if (isBase64Image(img)) {
              const oldLen = img.length;
              const compressed = await compressToWebp(img);
              if (compressed !== img) {
                totalBytesSaved += Math.max(0, oldLen - compressed.length);
                changed = true;
              }
              newGallery.push(compressed);
            } else {
              newGallery.push(img);
            }
          }
          if (changed) {
            profile.galleryImages = newGallery;
          }
        }

        if (changed) {
          await profile.save();
          updatedCount++;
        }
      }

      invalidateCache('public-profiles');

      const mbSaved = (totalBytesSaved / (1024 * 1024)).toFixed(2);
      return res.status(200).json({
        success: true,
        message: `Successfully optimized ${updatedCount} girl profile(s) to WebP format! Saved approx ${mbSaved} MB in MongoDB.`,
        updatedCount,
        bytesSaved: totalBytesSaved,
        mbSaved: Number(mbSaved),
      });
    } catch (error: any) {
      return res.status(500).json({ message: error.message || 'Failed to optimize database images.' });
    }
  }
}
