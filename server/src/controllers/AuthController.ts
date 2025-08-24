import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { Types } from 'mongoose';

import { VendorModel } from '../models/Vendor';
import { CustomerModel } from '../models/Customer';
import { ShipperModel } from '../models/Shipper';
import { UserRole } from '../models/UserRole';
import { UserModel } from '../models/User';
import { UserServices } from '../services/UserServices';
import { signJWT } from '../utils/SignHelper';

interface TokenPayload {
  userId: string;
  username: string;
  role: UserRole;
  hubId?: string;
}

// Register Vendor
export const registerVendor = async (req: Request, res: Response) => {
  try {
    const {
      username,
      password,
      businessName,
      businessAddress,
      profilePicture,
    } = req.body;

    if (!username || !password || !businessName || !businessAddress) {
      return res.status(400).json({
        message:
          'Username, password, business name, and business address are required.',
      });
    }

    // Check if username already exists
    const existingUser = await VendorModel.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ message: 'Username already exists.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create vendor
    const vendor = new VendorModel({
      username: username.trim(),
      password: hashedPassword,
      role: UserRole.VENDOR,
      businessName: businessName.trim(),
      businessAddress: businessAddress.trim(),
      profilePicture: profilePicture || '',
    });

    await vendor.save();

    // Generate JWT token
    const tokenPayload: TokenPayload = {
      userId: vendor.id.toString(),
      username: vendor.username,
      role: vendor.role,
    };

    const token = signJWT(tokenPayload);

    res.status(201).json({
      message: 'Vendor registered successfully',
      vendor: {
        id: vendor._id,
        username: vendor.username,
        businessName: vendor.businessName,
        businessAddress: vendor.businessAddress,
        profilePicture: vendor.profilePicture,
        role: vendor.role,
      },
      token,
    });
  } catch (error: unknown) {
    console.error('Vendor Registration Error:', error);

    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      error.code === 11000
    ) {
      const field =
        error && typeof error === 'object' && 'keyPattern' in error
          ? Object.keys(error.keyPattern as object)[0]
          : 'field';
      return res.status(409).json({
        message: `${field} already exists.`,
      });
    }

    res.status(500).json({ message: 'Internal server error' });
  }
};

// Register Customer
export const registerCustomer = async (req: Request, res: Response) => {
  try {
    const { username, password, name, address, profilePicture } = req.body;

    if (!username || !password || !name || !address) {
      return res.status(400).json({
        message: 'Username, password, name, and address are required.',
      });
    }

    // Check if username already exists
    const existingUser = await CustomerModel.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ message: 'Username already exists.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create customer
    const customer = new CustomerModel({
      username: username.trim(),
      password: hashedPassword,
      role: UserRole.CUSTOMER,
      name: name.trim(),
      address: address.trim(),
      profilePicture: profilePicture || '',
    });

    await customer.save();

    // Generate JWT token
    const tokenPayload: TokenPayload = {
      userId: customer.id.toString(),
      username: customer.username,
      role: customer.role,
    };

    const token = signJWT(tokenPayload);

    res.status(201).json({
      message: 'Customer registered successfully',
      customer: {
        id: customer._id,
        username: customer.username,
        name: customer.name,
        address: customer.address,
        profilePicture: customer.profilePicture,
        role: customer.role,
      },
      token,
    });
  } catch (error: unknown) {
    console.error('Customer Registration Error:', error);

    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      error.code === 11000
    ) {
      return res.status(409).json({
        message: 'Username already exists.',
      });
    }

    res.status(500).json({ message: 'Internal server error' });
  }
};

// Register Shipper
export const registerShipper = async (req: Request, res: Response) => {
  try {
    const { username, password, profilePicture } = req.body;
    const hubRaw = req.body.distributionHub ?? req.body.assignedHub ?? req.body.hub;

    if (!username) return res.status(400).json({ message: 'Username is required.' });
    if (!password) return res.status(400).json({ message: 'Password is required.' });
    if (!hubRaw) return res.status(400).json({ message: 'Assigned hub is required.' });

    if (!Types.ObjectId.isValid(hubRaw)) {
      return res.status(400).json({ message: 'Assigned hub must be a valid ObjectId.' });
    }
    const distributionHub = new Types.ObjectId(hubRaw);

    // Check if username already exists
    const existingUser = await UserModel.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ message: 'Username already exists.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create shipper
    const shipper = await ShipperModel.create({
      username: username.trim(),
      password: hashedPassword,
      role: UserRole.SHIPPER,
      profilePicture: profilePicture || '',
      distributionHub
    });

    // Generate JWT token
    const tokenPayload: TokenPayload = {
      userId: shipper.id.toString(),
      username: shipper.username,
      role: UserRole.SHIPPER,
      hubId: shipper.distributionHub.toString()
    };

    const token = signJWT(tokenPayload);

    res.status(201).json({
      message: 'Shipper registered successfully',
      shipper: {
        id: shipper._id,
        username: shipper.username,
        distributionHub: shipper.distributionHub,
        profilePicture: shipper.profilePicture,
        role: shipper.role,
      },
      token,
    });
  } catch (error: unknown) {
    console.error('Shipper Registration Error:', error);

    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      error.code === 11000
    ) {
      return res.status(409).json({
        message: 'Username already exists.',
      });
    }

    res.status(500).json({ message: 'Internal server error' });
  }
};

// Login for all user types
export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ message: "Username and password are required." });

    const user = await UserServices.findByUserName(username);
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials." });

    const isShipper = user.role === UserRole.SHIPPER;
    const hubId = isShipper && (user as any).distributionHub
      ? (user as any).distributionHub.toString()
      : undefined;

    // Create token using USERS id (not role id)
    const tokenPayload: TokenPayload = {
      userId: user.id.toString(),
      username: user.username,
      role: user.role,
      ...(hubId ? { hubId } : {})
    };
    const token = signJWT(tokenPayload);

    const userData: Record<string, unknown> = {
      id: user._id,
      username: user.username,
      role: user.role,
      profilePicture: user.profilePicture,
    };

    if (user.role === UserRole.SHIPPER) {
      userData.distributionHub = (user as any).distributionHub;
    }

    return res.status(200).json({ message: "Login successful", user: userData, token });
  } catch (err) {
    console.error("Login Error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Logout
export const logout = async (req: Request, res: Response) => {
  try {
    res.status(200).json({
      message: 'Logout successful',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Logout Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
