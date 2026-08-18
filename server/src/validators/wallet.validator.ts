import { z } from 'zod';

export const rechargeSchema = z.object({
  body: z.object({
    amount: z.number().positive('Amount must be positive'),
    paymentMethod: z.string().min(1, 'Payment method required'),
    referenceNumber: z.string().min(3, 'Reference number required'),
    receiptUrl: z.string().optional(),
  }),
});

export const withdrawalSchema = z.object({
  body: z.object({
    amount: z.number().positive('Amount must be positive'),
    bankName: z.string().min(2, 'Bank name is required'),
    accountHolder: z.string().min(2, 'Account holder name is required'),
    accountNumber: z.string().min(5, 'Account number is required'),
    ifscCode: z.string().optional(),
  }),
});
