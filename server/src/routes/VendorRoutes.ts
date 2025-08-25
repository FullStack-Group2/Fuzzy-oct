import { Router } from 'express';

import * as vendorController from '../controllers/VendorController';
import { authMiddleware, requireVendor } from '../middleware/authMiddleware';

const router = Router();

router.get("/orders", authMiddleware, requireVendor, vendorController.getAllOrders);
router.get("/orders/:id", authMiddleware, requireVendor, vendorController.getOrderDetails);
router.patch("/orders/:id/status", authMiddleware, requireVendor, vendorController.updateStatus);

// Routes
router.get(
  '/:vendorId',
  authMiddleware,
  requireVendor,
  vendorController.getVendorById,
);

export default router;
