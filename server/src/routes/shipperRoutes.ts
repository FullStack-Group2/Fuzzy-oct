import { Router, Response, NextFunction } from 'express';
import * as shipperController from '../controllers/ShipperController';
import { authMiddleware, AuthenticatedRequest } from '../middleware/authMiddleware';
import { requireShipper } from '../middleware/roleMiddleware';

const router = Router();

/**
 * Ensure hubId is available for shipper requests that need it.
 * We rely on authMiddleware (merged earlier) to put hubId on req.user for SHIPPER.
 * If a route wants hubId in query (HEAD behavior), we mirror it into req.query.hubId.
 */
function ensureHubInRequest(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  if (!req.user || req.user.role !== 'SHIPPER') {
    return res.status(403).json({ message: 'Shipper role required.' });
  }
  const hubId = req.user.hubId;
  if (!hubId) {
    return res.status(403).json({ message: 'Shipper hub not found.' });
  }
  if (!req.query.hubId) {
    (req.query as any).hubId = hubId;
  }
  next();
}

// Everything below requires auth + shipper role
router.use(authMiddleware, requireShipper);

// HEAD branch order operations (active orders in hub, details, status updates)
router.get('/orders', ensureHubInRequest, shipperController.listActiveOrders);
router.get('/orders/:id', ensureHubInRequest, shipperController.getOrderDetail);
router.patch('/orders/:id/status', ensureHubInRequest, shipperController.patchOrderStatus);

// dev branch profile endpoints
router.get('/:id', shipperController.getShipperById);
router.put('/:id', shipperController.updateShipper);

export default router;
