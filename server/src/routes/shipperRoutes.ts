import { Router } from 'express';
import { authMiddleware, requireShipper } from '../middleware/authMiddleware';
import {
  getAssignedOrders,
  getOrderDetails,
  updateOrderStatus,
} from '../controllers/ShipperController';

const router = Router();

// All shipper routes require auth + shipper role
router.get('/orders', authMiddleware, requireShipper, getAssignedOrders);
router.get('/orders/:orderId', authMiddleware, requireShipper, getOrderDetails);
router.patch('/orders/:orderId', authMiddleware, requireShipper, updateOrderStatus);

export default router;
