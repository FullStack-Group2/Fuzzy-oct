import { Router } from 'express';

import * as customerController from '../controllers/CustomerController';
import { authMiddleware } from '../middleware/authMiddleware';
import { requireCustomer } from '../middleware/roleMiddleware';

const router = Router();

//Product
router.get(
  '/products',
  authMiddleware,
  requireCustomer,
  customerController.getAllProducts,
);

router.get(
  '/products/:productId',
  authMiddleware,
  requireCustomer,
  customerController.getProduct,
);

// Cart
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
  '/cart',
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

// Orders (create + history/detail/actions)
router.post(
  '/orders',
  authMiddleware,
  requireCustomer,
  customerController.createOrder,
);
router.get(
  '/orders',
  authMiddleware,
  requireCustomer,
  customerController.listCustomerOrders,
);
router.get(
  '/orders/:id',
  authMiddleware,
  requireCustomer,
  customerController.getCustomerOrderDetail,
);
router.patch(
  '/orders/:id/status',
  authMiddleware,
  requireCustomer,
  customerController.patchCustomerOrderStatus,
);

export default router;
