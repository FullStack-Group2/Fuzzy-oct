// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author: Truong Quoc Tri
// ID: 4010989

import { Router, Response, NextFunction } from 'express';
import * as shipperController from '../controllers/ShipperController';
import {
  authMiddleware,
  AuthenticatedRequest,
} from '../middleware/authMiddleware';
import { requireShipper } from '../middleware/roleMiddleware';

const router = Router();

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
router.patch(
  '/orders/:id/status',
  ensureHubInRequest,
  shipperController.patchOrderStatus,
);

// dev branch profile endpoints
router.get('/:id', shipperController.getShipperById);
router.put('/:id', shipperController.updateShipper);

export default router;
