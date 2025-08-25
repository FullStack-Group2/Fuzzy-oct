import { Router } from 'express';

import * as customerController from '../controllers/CustomerController';
import { requireCustomer } from '../middleware/roleMiddleware';
import { authMiddleware } from '../middleware/authMiddleware';
const router = Router();

// Routes
router.get('/cart', authMiddleware, requireCustomer, customerController.getCart);
router.post('/cart', authMiddleware, requireCustomer, customerController.addToCart);
router.delete('/cart/:productId', authMiddleware, requireCustomer, customerController.removeItemFromCart);
router.post('/orders', authMiddleware, requireCustomer, customerController.createOrder);
export default router;

