import { Router } from 'express';

import * as customerController from '../controllers/CustomerController';
import { authMiddleware } from '../middleware/authMiddleware';
import { requireCustomer } from '../middleware/roleMiddleware';

const router = Router();

// Routes
router.get(
  '/:id',
  authMiddleware,
  requireCustomer,
  customerController.getCustomerById,
);

export default router;
