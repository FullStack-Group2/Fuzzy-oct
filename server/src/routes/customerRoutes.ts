import { Router } from 'express';

import * as customerController from '../controllers/CustomerController';
import { authMiddleware } from '../middleware/authMiddleware';
import { requireCustomer } from '../middleware/roleMiddleware';

const router = Router();

// Routes

router.get(
  '/products',
  authMiddleware,
  requireCustomer,
  customerController.getAllProducts,
);
router.get(
  '/stores/:storeId',
  authMiddleware,
  requireCustomer,
  customerController.getProductByStore,
);

router.get(
  '/cart',
  authMiddleware,
  requireCustomer,
  customerController.getCart,
);
router.post(
  '/cart',
  authMiddleware,
  requireCustomer,
  customerController.addToCart,
);

router.put(
  '/cart/',
  authMiddleware,
  requireCustomer,
  customerController.updateCartItem,
);

router.delete(
  '/cart/:productId',
  authMiddleware,
  requireCustomer,
  customerController.removeItemFromCart,
);
router.post(
  '/orders',
  authMiddleware,
  requireCustomer,
  customerController.createOrder,
);
export default router;
