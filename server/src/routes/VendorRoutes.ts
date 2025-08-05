import { Router } from 'express';

import * as vendorController from '../controllers/VendorController';

const router = Router();

// Routes
router.get('/:vendorId', vendorController.getVendorById);

export default router;
