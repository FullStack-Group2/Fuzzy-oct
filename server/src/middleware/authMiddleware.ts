import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { VendorModel } from '../models/Vendor';
import { CustomerModel } from '../models/Customer';
import { ShipperModel } from '../models/Shipper';
import { UserRole } from '../models/UserRole';

const JWT_SECRET = process.env.JWT_SECRET;

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    username: string;
    role: UserRole;
  };
}

export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!JWT_SECRET) {
      console.error('JWT_SECRET is not defined in environment variables');
      return res.status(500).json({
        message: 'Server configuration error.',
      });
    }
    console.log("jwt secret", JWT_SECRET);

    const authHeader = req.headers.authorization;
    console.log("auth header", authHeader);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        message: 'Access denied. No token provided or invalid format.',
      });
    }

    const token = authHeader.split(" ")[1]; // Remove 'Bearer ' prefix

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as {
        userId: string;
        username: string;
        role: UserRole;
      };

      // Verify user still exists in database
      let user = null;
      switch (decoded.role) {
        case UserRole.VENDOR:
          user = await VendorModel.findById(decoded.userId);
          break;
        case UserRole.CUSTOMER:
          user = await CustomerModel.findById(decoded.userId);
          break;
        case UserRole.SHIPPER:
          user = await ShipperModel.findById(decoded.userId);
          break;
        default:
          return res.status(401).json({ message: 'Invalid user role.' });
      }

      if (!user) {
        return res.status(401).json({ message: 'User no longer exists.' });
      }

      req.user = {
        userId: decoded.userId,
        username: decoded.username,
        role: decoded.role,
      };

      next();
    } catch (jwtError) {
      return res.status(401).json({ message: 'Invalid token.' });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

