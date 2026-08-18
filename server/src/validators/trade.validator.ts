import { z } from 'zod';

export const tradeSchema = z.object({
  body: z.object({
    productId: z.string().min(1, 'Product ID is required'),
    quantity: z.number().int().positive('Quantity must be at least 1').default(1),
  }),
});
