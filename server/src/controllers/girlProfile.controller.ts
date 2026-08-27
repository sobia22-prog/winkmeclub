import { Request, Response } from 'express';
import { GirlProfile } from '../models/girlProfile.model';
import { GirlCategory } from '../models/girlCategory.model';
import { AuthRequest } from '../middleware/auth.middleware';

export class GirlProfileController {
  // Get all active profiles (Public for Home & Matches)
  static async getPublicProfiles(req: Request, res: Response) {
    try {
      const { category, city, search } = req.query;
      const query: any = { isActive: true };

      if (category && String(category).toUpperCase() !== 'ALL') {
        query.categories = { $in: [new RegExp(String(category), 'i')] };
      }
      if (city && String(city).toUpperCase() !== 'ALL') {
        query.location = new RegExp(String(city), 'i');
      }
      if (search) {
        query.$or = [
          { name: new RegExp(String(search), 'i') },
          { bio: new RegExp(String(search), 'i') },
          { location: new RegExp(String(search), 'i') },
        ];
      }

      const profiles = await GirlProfile.find(query).sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        count: profiles.length,
        profiles,
      });
    } catch (error: any) {
      return res.status(500).json({ message: error.message || 'Failed to fetch girl profiles.' });
    }
  }

  // Get profile by ID
  static async getProfileById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const profile = await GirlProfile.findById(id);
      if (!profile) {
        return res.status(404).json({ message: 'Profile not found.' });
      }
      return res.status(200).json({ success: true, profile });
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
        profileImage,
        galleryImages: Array.isArray(galleryImages) ? galleryImages : [],
      });

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

      const profile = await GirlProfile.findByIdAndUpdate(id, updates, { new: true });
      if (!profile) {
        return res.status(404).json({ message: 'Profile not found.' });
      }

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
}
