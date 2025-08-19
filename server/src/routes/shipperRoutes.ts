import { Router } from 'express';

import * as shipperController from '../controllers/ShiperController';
import { authMiddleware } from '../middleware/authMiddleware';
import { requireShipper } from '../middleware/roleMiddleware';

const router = Router();

// Routes
router.get(
  '/:id',
  authMiddleware,
  requireShipper,
  shipperController.getShipperById,
);

export default router;
