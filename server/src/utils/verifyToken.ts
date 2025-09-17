// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author: Le Nguyen Khuong Duy
// ID: s402664

import jwt from 'jsonwebtoken';
import { UserRole } from '../models/UserRole';
import { UserServices } from '../services/UserServices';

const JWT_SECRET = process.env.JWT_SECRET as string;

export interface TokenPayload {
  userId: string;
  username: string;
  role: UserRole;
}

export const verifyToken = async (token: string) => {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
  }

  let decoded: TokenPayload;
  try {
    decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    throw new Error('Invalid token');
  }

  const user = await UserServices.findById(decoded.userId);
  if (!user) {
    throw new Error('User no longer exists');
  }

  // Prepare user object
  let hubId: string | undefined;
  if (decoded.role === UserRole.SHIPPER) {
    const raw = (user as any).distributionHub;
    hubId =
      raw && typeof raw === 'object' && 'toString' in raw
        ? raw.toString()
        : (raw as string | undefined);
  }

  return {
    userId: decoded.userId,
    username: decoded.username,
    role: decoded.role,
    hubId,
  };
};
