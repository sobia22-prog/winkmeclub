import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model';
import { WalletService } from '../services/wallet.service';
import { OTP } from '../models/otp.model';
import { AuthRequest } from '../middleware/auth.middleware';

const generateToken = (userId: string) => {
  const secret = process.env.JWT_SECRET || 'wink_me_club_super_secret_jwt_key_2026';
  return jwt.sign({ userId }, secret, { expiresIn: '7d' });
};

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const { fullName, email, phone, password, city, gender } = req.body;

      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(400).json({ message: 'Email address is already registered.' });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const user = await User.create({
        fullName,
        email: email.toLowerCase(),
        phone,
        passwordHash,
        city,
        gender: gender || 'Female',
        role: 'USER',
        isVerified: false,
      });

      // Create wallet with initial zero balance
      await WalletService.getOrCreateWallet(user._id.toString());

      // Generate 6-digit OTP
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      await OTP.create({
        email: user.email,
        otp: otpCode,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 mins
      });

      console.log(`[OTP Sent to ${user.email}]: ${otpCode}`);

      return res.status(201).json({
        success: true,
        message: 'Registration successful! Verification OTP sent to your email.',
        email: user.email,
        otpDemoHint: otpCode, // Provided for instant demo testing ease
      });
    } catch (error: any) {
      return res.status(500).json({ message: error.message || 'Registration failed.' });
    }
  }

  static async verifyOTP(req: Request, res: Response) {
    try {
      const { email, otp } = req.body;
      const validOtp = await OTP.findOne({ email: email.toLowerCase(), otp });

      if (!validOtp) {
        return res.status(400).json({ message: 'Invalid or expired OTP code.' });
      }

      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) return res.status(404).json({ message: 'User not found.' });

      user.isVerified = true;
      await user.save();
      await OTP.deleteMany({ email: email.toLowerCase() });

      const token = generateToken(user._id.toString());
      return res.status(200).json({
        success: true,
        message: 'Email verified successfully!',
        token,
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          city: user.city,
          role: user.role,
          isVIP: user.isVIP,
          isVerified: user.isVerified,
        },
      });
    } catch (error: any) {
      return res.status(500).json({ message: error.message || 'OTP verification failed.' });
    }
  }

  static async resendOTP(req: Request, res: Response) {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) return res.status(404).json({ message: 'Account not found.' });

      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      await OTP.deleteMany({ email: user.email });
      await OTP.create({
        email: user.email,
        otp: otpCode,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      });

      console.log(`[Resent OTP to ${user.email}]: ${otpCode}`);

      return res.status(200).json({
        success: true,
        message: 'A new 6-digit OTP code has been sent to your email.',
        otpDemoHint: otpCode,
      });
    } catch (error: any) {
      return res.status(500).json({ message: error.message || 'Failed to resend OTP.' });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      if (!email || typeof email !== 'string' || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
      }

      const user = await User.findOne({ email: email.toLowerCase() });

      if (!user) {
        return res.status(401).json({ message: 'Invalid email or password credentials.' });
      }

      if (user.status === 'SUSPENDED') {
        return res.status(403).json({ message: 'Your account has been suspended by administration.' });
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid email or password credentials.' });
      }

      user.lastLoginAt = new Date();
      await user.save();

      const token = generateToken(user._id.toString());
      return res.status(200).json({
        success: true,
        message: 'Login successful!',
        token,
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          city: user.city,
          gender: user.gender,
          role: user.role,
          isVIP: user.isVIP,
          verificationStatus: user.verificationStatus,
          profileImage: user.profileImage,
          bio: user.bio,
        },
      });
    } catch (error: any) {
      return res.status(500).json({ message: error.message || 'Login failed.' });
    }
  }

  static async adminLogin(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      if (!email || typeof email !== 'string' || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
      }

      const user = await User.findOne({ email: email.toLowerCase(), role: 'ADMIN' });

      if (!user) {
        return res.status(401).json({ message: 'Invalid admin credentials or unauthorized account.' });
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid admin credentials.' });
      }

      const token = generateToken(user._id.toString());
      return res.status(200).json({
        success: true,
        message: 'Welcome to Admin Control Panel.',
        token,
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error: any) {
      return res.status(500).json({ message: error.message || 'Admin login failed.' });
    }
  }

  static async getMe(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
      const wallet = await WalletService.getOrCreateWallet(req.user._id.toString());

      return res.status(200).json({
        success: true,
        user: {
          id: req.user._id,
          fullName: req.user.fullName,
          email: req.user.email,
          phone: req.user.phone,
          city: req.user.city,
          gender: req.user.gender,
          role: req.user.role,
          isVIP: req.user.isVIP,
          vipExpiresAt: req.user.vipExpiresAt,
          verificationStatus: req.user.verificationStatus,
          profileImage: req.user.profileImage,
          bio: req.user.bio,
          age: req.user.age,
          interests: req.user.interests,
        },
        wallet: {
          availableBalance: wallet.availableBalance,
          frozenBalance: wallet.frozenBalance,
          totalBalance: wallet.totalBalance,
          currency: wallet.currency,
        },
      });
    } catch (error: any) {
      return res.status(500).json({ message: error.message || 'Failed to fetch user session.' });
    }
  }
}
