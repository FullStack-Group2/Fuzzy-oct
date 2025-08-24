import { Router, Request, Response, NextFunction } from "express";
import { authMiddleware, requireShipper, AuthenticatedRequest } from "../middleware/authMiddleware";
import { ShipperModel } from "../models/Shipper";
import { listActiveOrders, getOrderDetail, patchOrderStatus } from "../controllers/ShipperController";

/**
 * Middleware: attach the logged-in shipper's hub to the request so controllers
 * can filter by hub. We:
 *  - fetch the shipper to get its `hub`
 *  - (a) set req.query.hubId if it's not already provided (handy for list endpoint)
 *  - (b) also attach `hub` to req.user (as any) so controllers that read user.hub keep working
 */
async function attachShipperHub(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required." });
    }

    // Load the shipper doc to get assigned hub
    const shipper = await ShipperModel.findById(req.user.userId).select("distributionHub").lean();
    if (!shipper?.distributionHub) {
      return res.status(403).json({ message: "Shipper hub not found." });
    }

    const hubIdStr = String(shipper.distributionHub);

    // (a) Provide hubId to list endpoint via query if caller didn't provide
    if (!req.query.hubId) {
      // req.query is typed as ParsedQs | string, so cast to any for safe assignment
      (req.query as any).hubId = hubIdStr;
    }

    // (b) Ensure controllers that read user.hub can still work
    (req as any).user = { ...(req.user as any), hubId: hubIdStr };

    // Optional: expose a specific field if you prefer using req.shipperHubId in controllers
    (req as any).shipperHubId = hubIdStr;

    next();
  } catch (err) {
    console.error("attachShipperHub error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
}

const router = Router();

// All shipper APIs require: auth → shipper role → attach hub
router.use(authMiddleware, requireShipper, attachShipperHub);

// GET /api/shipper/orders        → returns OrderListDTO[] for ACTIVE orders at shipper's hub
router.get("/orders", listActiveOrders);

// GET /api/shipper/orders/:id    → returns OrderDetailDTO (also hub-checked inside controller)
router.get("/orders/:id", getOrderDetail);

// PATCH /api/shipper/orders/:id/status { status, reason? } → deliver/cancel (controller enforces ACTIVE → DELIVERED/CANCELED)
router.patch("/orders/:id/status", patchOrderStatus);

export default router;
