import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

import { VendorModel } from '../models/Vendor';
import { CustomerModel } from '../models/Customer';
import { ShipperModel } from '../models/Shipper';
import { UserRole } from '../models/UserRole';

const JWT_SECRET = process.env.JWT_SECRET;

interface TokenPayload {
  userId: string;
  username: string;
  role: UserRole;
}

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    username: string;
    role: UserRole;
    hubId?: string; // only for SHIPPER
  };
}

export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!JWT_SECRET) {
      console.error('JWT_SECRET is not defined');
      return res.status(500).json({ message: 'Server configuration error.' });
    }

    const authHeader = req.headers.authorization || '';
    if (!authHeader.startsWith('Bearer ')) {
      return res
        .status(401)
        .json({ message: 'Access denied. No token provided or invalid format.' });
    }

    // Extract token safely (supports both slice and split approaches)
    const token = authHeader.slice(7).trim() || authHeader.split(' ')[1];
    let decoded: TokenPayload;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    } catch {
      return res.status(401).json({ message: 'Invalid token.' });
    }

    // Verify the user still exists and attach role-specific context
    switch (decoded.role) {
      case UserRole.VENDOR: {
        const vendor = await VendorModel.findById(decoded.userId).lean();
        if (!vendor) return res.status(401).json({ message: 'User no longer exists.' });
        req.user = {
          userId: decoded.userId,
          username: decoded.username,
          role: decoded.role,
        };
        break;
      }
      case UserRole.CUSTOMER: {
        const customer = await CustomerModel.findById(decoded.userId).lean();
        if (!customer) return res.status(401).json({ message: 'User no longer exists.' });
        req.user = {
          userId: decoded.userId,
          username: decoded.username,
          role: decoded.role,
        };
        break;
      }
      case UserRole.SHIPPER: {
        // Keep HEAD behavior: surface hubId from shipper.distributionHub onto req.user
        const shipper = await ShipperModel.findById(decoded.userId)
          .select('distributionHub')
          .lean();
        if (!shipper) return res.status(401).json({ message: 'User no longer exists.' });

        const raw = (shipper as any).distributionHub;
        const hubId =
          raw && typeof raw === 'object' && 'toString' in raw ? raw.toString() : (raw as string | undefined);

        req.user = {
          userId: decoded.userId,
          username: decoded.username,
          role: decoded.role,
          hubId,
        };
        break;
      }
      default:
        return res.status(401).json({ message: 'Invalid user role.' });
    }

    return next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};
