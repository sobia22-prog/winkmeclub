import { z } from 'zod';

export const rechargeSchema = z.object({
  body: z.object({
    amount: z.any().optional(),
    paymentMethod: z.string().optional(),
    referenceNumber: z.string().optional(),
    receiptUrl: z.string().optional(),
  }),
});

export const withdrawalSchema = z.object({
  body: z.object({
    amount: z.any().optional(),
    paymentMethod: z.string().optional(),
    bankName: z.string().optional(),
    accountHolder: z.string().optional(),
    accountNumber: z.string().optional(),
    ifscCode: z.string().optional(),
    upiId: z.string().optional(),
    phonePe: z.string().optional(),
    paytm: z.string().optional(),
    googlePay: z.string().optional(),
    qrCodeUrl: z.string().optional(),
  }),
});
