import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters'),
    email: z.string().email('Invalid email address format'),
    phone: z.string().min(8, 'Phone number must be at least 8 digits'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    city: z.string().min(2, 'City is required'),
    gender: z.enum(['Male', 'Female', 'Non-Binary', 'Other']).optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address format'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const otpSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address format'),
    otp: z.string().length(6, 'OTP must be 6 digits'),
  }),
});
