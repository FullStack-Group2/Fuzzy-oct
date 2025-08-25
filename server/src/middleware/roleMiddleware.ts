import { NextFunction, Response } from 'express';
import { UserRole } from '../models/UserRole';
import { AuthenticatedRequest } from './authMiddleware';

// Role-based middleware
export const requireRole = (roles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: 'Access denied. Insufficient permissions.',
      });
    }
    next();
  };
};

// Specific role middlewares
export const requireVendor = requireRole([UserRole.VENDOR]);
export const requireCustomer = requireRole([UserRole.CUSTOMER]);
export const requireShipper = requireRole([UserRole.SHIPPER]);
export const requireVendorOrCustomer = requireRole([
  UserRole.VENDOR,
  UserRole.CUSTOMER,
]);
export const requireAnyRole = requireRole([
  UserRole.VENDOR,
  UserRole.CUSTOMER,
  UserRole.SHIPPER,
]);
