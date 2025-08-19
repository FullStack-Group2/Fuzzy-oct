import { Router } from 'express';

import * as vendorController from '../controllers/VendorController';
import { authMiddleware } from '../middleware/authMiddleware';
import { requireVendor } from '../middleware/roleMiddleware';

const router = Router();

// Routes
router.get(
  '/:id',
  authMiddleware,
  requireVendor,
  vendorController.getVendorById,
);
router.put(
  '/:id',
  authMiddleware,
  requireVendor,
  vendorController.updateVendor,
);

export default router;
