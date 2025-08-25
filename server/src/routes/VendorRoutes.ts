import { Router } from 'express';

import * as vendorController from '../controllers/VendorController';
import { authMiddleware, requireVendor } from '../middleware/authMiddleware';

const router = Router();

// Routes
router.get(
  '/products',
  authMiddleware,
  requireVendor,
  vendorController.getAllProducts,
);
router.get(
  '/:productId',
  authMiddleware,
  requireVendor,
  vendorController.getProduct,
);
router.get(
  '/:vendorId',
  authMiddleware,
  requireVendor,
  vendorController.getVendorById,
);
router.post('/add', authMiddleware, requireVendor, vendorController.addProduct);
router.get(
  '/:vendorId/orders',
  authMiddleware,
  requireVendor,
  vendorController.getActiveOrders,
);
router.get(
  '/:vendorId/order-history',
  authMiddleware,
  requireVendor,
  vendorController.getOrderHistory,
);
router.put(
  '/:productId',
  authMiddleware,
  requireVendor,
  vendorController.editProductDetails,
);
router.delete(
  '/:productId',
  authMiddleware,
  requireVendor,
  vendorController.deleteOneProduct,
);
router.get(
  '/:productId/sales',
  authMiddleware,
  requireVendor,
  vendorController.getProductSales,
);
// router.post/(‘/orders’, authMiddleware, requireVendor, vendorController.cancelOrder)

export default router;
