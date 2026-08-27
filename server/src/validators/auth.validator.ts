import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    invitationCode: z.string().min(1, 'Staff invitation code is required'),
    fullName: z.string().min(2, 'Username or name must be at least 2 characters'),
    username: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
    city: z.string().optional(),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    gender: z.enum(['Male', 'Female', 'Non-Binary', 'Other']).optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    username: z.string().optional(),
    email: z.string().optional(),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const staffLoginSchema = z.object({
  body: z.object({
    username: z.string().optional(),
    email: z.string().optional(),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const otpSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address format'),
    otp: z.string().length(6, 'OTP must be 6 digits'),
  }),
});
