// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author: Pham Le Gia Huy
// ID: s3975371

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

import { UserRole } from '../models/UserRole';
import { UserServices } from '../services/UserServices';

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
      return res.status(401).json({
        message: 'Access denied. No token provided or invalid format.',
      });
    }

    // Extract token safely (supports both slice and split approaches)
    const token = authHeader.split(' ')[1];
    let decoded: TokenPayload;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
      // console.log('Decoded JWT:', decoded);
    } catch {
      return res.status(401).json({ message: 'Invalid token.' });
    }

    // Verify the user still exists and attach role-specific context
    switch (decoded.role) {
      case UserRole.VENDOR: {
        const vendor = await UserServices.findById(decoded.userId);
        if (!vendor)
          return res.status(401).json({ message: 'User no longer exists.' });
        req.user = {
          userId: decoded.userId,
          username: decoded.username,
          role: decoded.role,
        };
        break;
      }
      case UserRole.CUSTOMER: {
        const customer = await UserServices.findById(decoded.userId);
        // console.log('decode user id', decoded.userId);
        // console.log('customer', customer);
        if (!customer)
          return res.status(401).json({ message: 'User no longer exists.' });
        req.user = {
          userId: decoded.userId,
          username: decoded.username,
          role: decoded.role,
        };
        break;
      }
      case UserRole.SHIPPER: {
        // Keep HEAD behavior: surface hubId from shipper.distributionHub onto req.user
        const shipper = await UserServices.findById(decoded.userId);
        if (!shipper)
          return res.status(401).json({ message: 'User no longer exists.' });

        const raw = (shipper as any).distributionHub;
        const hubId =
          raw && typeof raw === 'object' && 'toString' in raw
            ? raw.toString()
            : (raw as string | undefined);

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
