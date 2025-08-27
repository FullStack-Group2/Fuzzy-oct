import { Router } from "express";
import { authMiddleware, requireCustomer } from "../middleware/authMiddleware";
import {
  listCustomerOrders,
  getCustomerOrderDetail,
  patchCustomerOrderStatus,
} from "../controllers/CustomerController";

const router = Router();

router.get("/orders", authMiddleware, requireCustomer, listCustomerOrders);
router.get("/orders/:id", authMiddleware, requireCustomer, getCustomerOrderDetail);
router.patch("/orders/:id/status", authMiddleware, requireCustomer, patchCustomerOrderStatus);

export default router;
