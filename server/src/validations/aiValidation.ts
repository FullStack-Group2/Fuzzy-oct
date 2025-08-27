import { z } from 'zod';
import { ProductCategory } from '../models/ProductCategory';

// Chat message validation schema
export const chatSchema = z.object({
  message: z.string()
    .min(1, 'Message cannot be empty')
    .max(1000, 'Message too long')
    .trim(),
  userId: z.string().optional(),
  priceRange: z.object({
    min: z.number().min(0, 'Minimum price must be non-negative'),
    max: z.number().min(0, 'Maximum price must be non-negative')
  }).optional().refine(
    (data) => !data || data.min <= data.max,
    {
      message: "Minimum price must be less than or equal to maximum price"
    }
  ),
  category: z.enum(Object.values(ProductCategory) as [string, ...string[]]).optional(),
  color: z.string()
    .max(50, 'Color name too long')
    .trim()
    .optional()
});

// Product recommendation request schema
export const recommendationSchema = z.object({
  message: z.string()
    .min(1, 'Search query cannot be empty')
    .max(200, 'Search query too long')
    .trim(),
  priceRange: z.object({
    min: z.number().min(0, 'Minimum price must be non-negative'),
    max: z.number().min(0, 'Maximum price must be non-negative')
  }).optional().refine(
    (data) => !data || data.min <= data.max,
    {
      message: "Minimum price must be less than or equal to maximum price"
    }
  ),
  category: z.enum(Object.values(ProductCategory) as [string, ...string[]]).optional(),
  color: z.string()
    .max(50, 'Color name too long')
    .trim()
    .optional(),
  limit: z.number()
    .min(1, 'Limit must be at least 1')
    .max(20, 'Limit cannot exceed 20')
    .optional()
    .default(5)
});

// Type exports for TypeScript
export type ChatInput = z.infer<typeof chatSchema>;
export type RecommendationInput = z.infer<typeof recommendationSchema>;
