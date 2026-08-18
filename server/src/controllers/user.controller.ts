import { Response } from 'express';
import { User } from '../models/user.model';
import { AuthRequest } from '../middleware/auth.middleware';

export class UserController {
  static async updateProfile(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ message: 'Not authenticated' });

      const { fullName, phone, city, profileImage, gender, bio, interests, dob } = req.body;

      const user = await User.findById(req.user._id);
      if (!user) return res.status(404).json({ message: 'User not found' });

      if (fullName) user.fullName = fullName;
      if (phone) user.phone = phone;
      if (city) user.city = city;
      if (profileImage !== undefined) user.profileImage = profileImage;
      if (gender) user.gender = gender;
      if (bio !== undefined) user.bio = bio;
      if (interests) user.interests = interests;
      if (dob) user.dob = new Date(dob);

      await user.save();

      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully!',
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          city: user.city,
          gender: user.gender,
          bio: user.bio,
          profileImage: user.profileImage,
          interests: user.interests,
          isVIP: user.isVIP,
        },
      });
    } catch (error: any) {
      return res.status(500).json({ message: error.message || 'Failed to update profile.' });
    }
  }
}
