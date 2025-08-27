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

// Get product recommendations endpoint - requires authentication
router.post(
  '/recommendations',
  authMiddleware,
  validateBody(chatSchema),
  async (req, res) => {
    try {
      const { message, priceRange, category, color } = req.body;

      const recommendations = await AIController.getProductRecommendations(
        message,
        priceRange,
        category,
        color,
      );

      res.json({
        success: true,
        recommendations,
        count: recommendations.length,
      });
    } catch (error) {
      console.error('Recommendations Error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to get recommendations',
      });
    }
  },
);

// Get navigation help endpoint - requires authentication
router.get('/navigation-help', authMiddleware, (req, res) => {
  try {
    const navigationHelp = {
      routes: {
        '/': 'Home page - Main dashboard with overview',
        '/shop': 'Shop page - Browse and purchase furniture',
        '/products': 'Products page - Manage your products (Vendor only)',
        '/products/add':
          'Add Product - Create new furniture listings (Vendor only)',
        '/orders': 'Orders page - View and manage your orders',
        '/profile': 'Profile page - Manage your account settings',
      },
      features: {
        search: 'Use the search bar to find specific furniture items',
        filter: 'Filter products by category, price range, or availability',
        cart: 'Add items to cart and checkout securely',
        account: 'Manage your profile, addresses, and preferences',
      },
      categories: Object.values(ProductCategory),
      tips: [
        'Use specific keywords when asking for product recommendations',
        'Include your budget range for better suggestions',
        'Mention colors or styles you prefer',
        "Ask for help navigating if you're lost",
      ],
    };

    res.json({
      success: true,
      navigationHelp,
    });
  } catch (error) {
    console.error('Navigation Help Error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to get navigation help',
    });
  }
});

export default router;
