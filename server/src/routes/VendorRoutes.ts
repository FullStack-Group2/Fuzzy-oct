import { Router } from 'express';

import * as vendorController from '../controllers/VendorController';
import { authMiddleware, requireVendor } from '../middleware/authMiddleware';

const router = Router();

// Routes
router.get(
  '/:vendorId',
  authMiddleware,
  requireVendor,
  vendorController.getVendorById,
);

export default router;
