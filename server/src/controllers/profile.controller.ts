import { Response } from 'express';
import { User } from '../models/user.model';
import { AuthRequest } from '../middleware/auth.middleware';

export class ProfileController {
  static async getMatches(req: AuthRequest, res: Response) {
    try {
      const currentUserId = req.user?._id;
      const { city, cities, gender, vipOnly, ageMin, ageMax, search } = req.query;

      const query: any = {
        _id: { $ne: currentUserId },
        status: 'ACTIVE',
      };

      const cityParam = (cities || city) as string;
      if (cityParam && cityParam !== 'All') {
        const cityList = cityParam.split(',').map((c) => c.trim()).filter((c) => c && c !== 'All');
        if (cityList.length > 0) {
          query.city = { $in: cityList.map((c) => new RegExp(`^${c}$`, 'i')) };
        }
      }
      if (gender && gender !== 'All') {
        query.gender = gender;
      }
      if (vipOnly === 'true') {
        query.isVIP = true;
      }
      if (ageMin || ageMax) {
        query.age = {};
        if (ageMin) query.age.$gte = Number(ageMin);
        if (ageMax) query.age.$lte = Number(ageMax);
      }
      if (search) {
        query.$or = [
          { fullName: { $regex: search as string, $options: 'i' } },
          { bio: { $regex: search as string, $options: 'i' } },
          { city: { $regex: search as string, $options: 'i' } },
        ];
      }

      // MongoDB aggregation to randomize returned set
      const profiles = await User.aggregate([
        { $match: query },
        { $sample: { size: 30 } },
        {
          $project: {
            passwordHash: 0,
            __v: 0,
          },
        },
      ]);

      return res.status(200).json({
        success: true,
        count: profiles.length,
        profiles,
      });
    } catch (error: any) {
      return res.status(500).json({ message: error.message || 'Failed to fetch match profiles.' });
    }
  }

  static async getProfileById(req: AuthRequest, res: Response) {
    try {
      const profile = await User.findById(req.params.id).select('-passwordHash');
      if (!profile) return res.status(404).json({ message: 'Profile not found.' });

      return res.status(200).json({
        success: true,
        profile,
      });
    } catch (error: any) {
      return res.status(500).json({ message: error.message || 'Failed to fetch profile details.' });
    }
  }
}
