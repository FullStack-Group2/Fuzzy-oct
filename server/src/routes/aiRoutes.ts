import { Router } from 'express';
import { AIController } from '../controllers/AIController';
import { authMiddleware } from '../middleware/authMiddleware';
import { validateBody } from '../middleware/validation';
import { z } from 'zod';
import { ProductCategory } from '../models/ProductCategory';

const router = Router();

// Chat message validation schema
const chatSchema = z.object({
  message: z
    .string()
    .min(1, 'Message cannot be empty')
    .max(1000, 'Message too long'),
  userId: z.string().optional(),
  priceRange: z
    .object({
      min: z.number().min(0, 'Minimum price must be non-negative'),
      max: z.number().min(0, 'Maximum price must be non-negative'),
    })
    .optional()
    .refine((data) => !data || data.min <= data.max, {
      message: 'Minimum price must be less than or equal to maximum price',
    }),
  category: z
    .enum(Object.values(ProductCategory) as [string, ...string[]])
    .optional(),
  color: z.string().max(50, 'Color name too long').optional(),
});

// AI Chat endpoint - requires authentication
router.post(
  '/chat',
  authMiddleware,
  validateBody(chatSchema),
  AIController.chat,
);

export default router;
