import { Router } from 'express';

import * as vendorController from '../controllers/VendorController';
import { authMiddleware } from '../middleware/authMiddleware';
import { requireVendor } from '../middleware/roleMiddleware';

const router = Router();

// Routes
router.get(
  '/products',
  authMiddleware,
  requireVendor,
  vendorController.getAllProducts,
);
router.get(
  '/product/:productId',
  authMiddleware,
  requireVendor,
  vendorController.getProduct,
);
router.get(
  '/:id',
  authMiddleware,
  requireVendor,
  vendorController.getVendorById,
);
router.post(
  '/add-product',
  authMiddleware,
  requireVendor,
  vendorController.addProduct,
);
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
  '/product/:productId',
  authMiddleware,
  requireVendor,
  vendorController.editProductDetails,
);
router.delete(
  '/product/:productId',
  authMiddleware,
  requireVendor,
  vendorController.deleteOneProduct,
);
router.get(
  'product/:productId/sales',
  authMiddleware,
  requireVendor,
  vendorController.getProductSales,
);
// router.post/(‘/orders’, authMiddleware, requireVendor, vendorController.cancelOrder)
router.put(
  '/:id',
  authMiddleware,
  requireVendor,
  vendorController.updateVendor,
);

export default router;
