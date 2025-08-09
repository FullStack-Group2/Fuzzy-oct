import { Router } from 'express';

import * as vendorController from '../controllers/VendorController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Routes
router.get('/:vendorId', authMiddleware, vendorController.getVendorById);

export default router;
