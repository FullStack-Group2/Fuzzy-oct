import { Request, Response } from 'express';
import bcrypt from 'bcrypt';

import { VendorModel } from '../models/Vendor';
import { CustomerModel } from '../models/Customer';
import { ShipperModel } from '../models/Shipper';
import { UserRole } from '../models/UserRole';
import { UserServices } from '../services/UserServices';
import { signJWT } from '../utils/SignHelper';

interface TokenPayload {
  userId: string;
  username: string;
  role: UserRole;
}

// Register Vendor
export const registerVendor = async (req: Request, res: Response) => {
  try {
    const {
      username,
      email,
      password,
      businessName,
      businessAddress,
      profilePicture,
    } = req.body;

    if (!username || !email || !password || !businessName || !businessAddress) {
      return res.status(400).json({
        message:
          'Username, email, password, business name, and business address are required.',
      });
    }

    // Check if username already exists
    const existingUser = await UserServices.usernameExists(username);
    if (existingUser) {
      return res.status(409).json({ message: 'Username already exists.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create vendor
    const vendor = new VendorModel({
      username: username.trim(),
      email: email.trim().toLowerCase(),
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
        email: vendor.email,
        businessName: vendor.businessName,
        businessAddress: vendor.businessAddress,
        profilePicture: vendor.profilePicture,
        role: vendor.role,
      },
      token,
    });
  } catch (error: unknown) {
    console.error('Vendor Registration Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Register Customer
export const registerCustomer = async (req: Request, res: Response) => {
  try {
    const { username, email, password, name, address, profilePicture } = req.body;

    if (!username || !email || !password || !name || !address) {
      return res.status(400).json({
        message: 'Username, email, password, name, and address are required.',
      });
    }

    // Check if username already exists
    const existingUser = await UserServices.usernameExists(username);
    if (existingUser) {
      return res.status(409).json({ message: 'Username already exists.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create customer
    const customer = new CustomerModel({
      username: username.trim(),
      email: email.trim().toLowerCase(),
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
        email: customer.email,
        name: customer.name,
        address: customer.address,
        profilePicture: customer.profilePicture,
        role: customer.role,
      },
      token,
    });
  } catch (error: unknown) {
    console.error('Customer Registration Error:', error);

    res.status(500).json({ message: 'Internal server error' });
  }
};

// Register Shipper
export const registerShipper = async (req: Request, res: Response) => {
  try {
    const { username, email, password, assignedHub, profilePicture } = req.body;

    if (!username || !email || !password || !assignedHub) {
      return res.status(400).json({
        message: 'Username, email, password, and assigned hub are required.',
      });
    }

    // Check if username already exists
    const existingUser = await UserServices.usernameExists(username);
    if (existingUser) {
      return res.status(409).json({ message: 'Username already exists.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create shipper
    const shipper = new ShipperModel({
      username: username.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      role: UserRole.SHIPPER,
      assignedHub,
      profilePicture: profilePicture || '',
    });

    await shipper.save();

    // Generate JWT token
    const tokenPayload: TokenPayload = {
      userId: shipper.id.toString(),
      username: shipper.username,
      role: shipper.role,
    };

    const token = signJWT(tokenPayload);

    res.status(201).json({
      message: 'Shipper registered successfully',
      shipper: {
        id: shipper._id,
        username: shipper.username,
        email: shipper.email,
        assignedHub: shipper.assignedHub,
        profilePicture: shipper.profilePicture,
        role: shipper.role,
      },
      token,
    });
  } catch (error: unknown) {
    console.error('Shipper Registration Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Login for all user types
export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        message: 'Username and password are required.',
      });
    }

    const user = await UserServices.findByUserName(username);
    if (!user) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ message: 'Invalid credentials.' });
      return;
    }

    // Generate JWT token
    const tokenPayload: TokenPayload = {
      userId: user.id.toString(),
      username: user.username,
      role: user.role,
    };

    const token = signJWT(tokenPayload);

    // Prepare user data (without password)
    const userData: Record<string, unknown> = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      profilePicture: user.profilePicture,
    };

    // Fetch role-specific data
    switch (user.role) {
      case UserRole.VENDOR: {
        const vendor = await VendorModel.findById(user._id);
        if (vendor) {
          userData.businessName = vendor.businessName;
          userData.businessAddress = vendor.businessAddress;
        }
        break;
      }
      case UserRole.CUSTOMER: {
        const customer = await CustomerModel.findById(user._id);
        if (customer) {
          userData.name = customer.name;
          userData.address = customer.address;
        }
        break;
      }
      case UserRole.SHIPPER: {
        const shipper = await ShipperModel.findById(user._id).populate(
          'assignedHub',
        );
        if (shipper) {
          userData.assignedHub = shipper.assignedHub;
        }
        break;
      }
    }

    return res.status(200).json({
      message: 'Login successful',
      user: userData,
      token,
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Internal server error' });
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

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required.' });
    }

    // Check if user exists
    const user = await UserServices.findByEmail(email);
    if (!user) {
      return res.status(404).json({ message: 'Email is not correct.' });
    }

      // send email based on id and email
      // const emailSent = await emailService.sendPasswordResetEmail(
      //   emailExists.id,
      //   email,
      //   emailExists.fullName,
      // );

      // if (!emailSent) {
      //   res.status(500).json({ error: "Failed to send password reset email." });
      //   return;
      // }

      res.status(200).json({ status: "Verification email sent successfully" });
  } catch (error) {
    console.error('Forgot Password Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { userId, newPassword } = req.body;

    if (!userId || !newPassword) {
      return res.status(400).json({ message: 'User ID and new password are required.' });
    }

    // Find user by ID
    const user = await UserServices.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update user's password
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: 'Password reset successfully.' });
  } catch (error) {
    console.error('Reset Password Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}