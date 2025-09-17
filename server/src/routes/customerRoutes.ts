// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author: Truong Quoc Tri, Pham Nhat Minh
// ID: s4010989, s4019811

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

// Customer by ID route - MUST be last to avoid conflicts with specific routes
router.get(
  '/:id',
  authMiddleware,
  requireCustomer,
  customerController.getCustomerById,
);

router.put(
  '/:id',
  authMiddleware,
  requireCustomer,
  customerController.updateCustomer,
);

export default router;
