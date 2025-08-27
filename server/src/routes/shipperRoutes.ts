import { Router, Request, Response, NextFunction } from "express";
import { authMiddleware, requireShipper, AuthenticatedRequest } from "../middleware/authMiddleware";
import { ShipperModel } from "../models/Shipper";
import { listActiveOrders, getOrderDetail, patchOrderStatus } from "../controllers/ShipperController";

async function attachShipperHub(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required." });
    }

    const shipper = await ShipperModel.findById(req.user.userId).select("distributionHub").lean();
    if (!shipper?.distributionHub) {
      return res.status(403).json({ message: "Shipper hub not found." });
    }

    const hubIdStr = String(shipper.distributionHub);

    if (!req.query.hubId) {
      (req.query as any).hubId = hubIdStr;
    }

    (req as any).user = { ...(req.user as any), hubId: hubIdStr };

    (req as any).shipperHubId = hubIdStr;

    next();
  } catch (err) {
    console.error("attachShipperHub error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
}

const router = Router();

router.use(authMiddleware, requireShipper, attachShipperHub);
router.get("/orders", requireShipper, listActiveOrders);
router.get("/orders/:id", requireShipper, getOrderDetail);
router.patch("/orders/:id/status", requireShipper, patchOrderStatus);

export default router;
