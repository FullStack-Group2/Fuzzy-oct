import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { VendorModel } from '../models/Vendor';
import { CustomerModel } from '../models/Customer';
import { ShipperModel } from '../models/Shipper';
import { UserRole } from '../models/UserRole';
import { UserModel } from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET;

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    username: string;
    role: UserRole;
    hubId?: string;
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

    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Access denied. No token provided or invalid format.' });
    }

    const token = authHeader.substring(7);
    let decoded: { userId: string; username: string; role: UserRole };
    try {
      decoded = jwt.verify(token, JWT_SECRET) as any;
    } catch {
      return res.status(401).json({ message: 'Invalid token.' });
    }

    let roleDoc: any = null;
    switch (decoded.role) {
      case UserRole.VENDOR:
        roleDoc = await VendorModel.findById(decoded.userId).lean();
        break;
      case UserRole.CUSTOMER:
        roleDoc = await CustomerModel.findById(decoded.userId).lean();
        
        break;
      case UserRole.SHIPPER: {
        const shipper = await ShipperModel.findById(decoded.userId).select('distributionHub').lean();
        if (!shipper) return res.status(401).json({ message: "User no longer exists." });

        const raw = shipper.distributionHub;
        const hubId = raw && typeof raw === "object" && "toString" in raw ? raw.toString() : (raw as any);

        req.user = {
          userId: decoded.userId,         // users._id
          username: decoded.username,
          role: decoded.role,
          hubId,                          // controllers use this
        };
        return next();
      }
      default:
        return res.status(401).json({ message: 'Invalid user role.' });
    }

    if (!roleDoc) return res.status(401).json({ message: 'User no longer exists.' });

    req.user = {
      userId: decoded.userId,
      username: decoded.username,
      role: decoded.role,
    };
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};


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
