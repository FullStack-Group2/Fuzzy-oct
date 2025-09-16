import { Router } from 'express';
import { AIController } from '../controllers/AIController';
import { authMiddleware } from '../middleware/authMiddleware';
import { validateBody } from '../middleware/validation';
import { z } from 'zod';

const router = Router();

const chatSchema = z.object({
  message: z
    .string()
    .min(1, 'Message cannot be empty')
    .max(1000, 'Message too long'),
});

// AI Chat endpoint - requires authentication
router.post(
  '/chat',
  authMiddleware,
  validateBody(chatSchema),
  AIController.chat,
);

export default router;
