import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import * as vendorService from '../services/VendorService';
import { validatePassword } from '../services/AuthenticationService';
import { findVendorByUsername } from '../services/VendorService';

export const registerVendor = async (req: Request, res: Response) => {
  try {
    const {
      username,
      password,
      businessName,
      businessAddress,
      profilePicture,
    } = req.body;

    // 1. Validate that required fields are not empty
    // The profilePicture is now expected as a URL string in the body
    if (!username || !password || !businessName || !businessAddress) {
      return res.status(400).json({
        message: 'All fields, including profile picture URL, are required.',
      });
    }

    // 2. Check for uniqueness constraints before attempting to save
    const existingUsername = await vendorService.findVendorByUsername(username);
    if (existingUsername) {
      return res.status(409).json({ message: 'Username already exists.' }); // 409 Conflict
    }

    const existingBusinessName =
      await vendorService.findVendorByBusinessName(businessName);
    if (existingBusinessName) {
      return res
        .status(409)
        .json({ message: 'Business name is already registered.' });
    }

    // 3. Create the new vendor with the provided profile picture URL
    const hashedPassword = await bcrypt.hash(password, 10);
    const vendorData = {
      username,
      password: hashedPassword,
      businessName,
      businessAddress,
      profilePicture, // Use the URL from the request body
    };

    const newVendor = await vendorService.createVendor(vendorData);

    res
      .status(200)
      .json({ message: 'Vendor registered successfully', vendor: newVendor });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  let { username } = req.body;
  const { password } = req.body;
  username = username.trim();

  if (!username || !password) {
    res.status(400).json({ message: 'Username and password are required' });
    return;
  }

  try {
    const vendor = await findVendorByUsername(username);
    if (!vendor) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const isPasswordValid = await validatePassword(password, vendor.password);
    if (!isPasswordValid) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    res.status(200).json({
      message: 'Login successful',
      user: {
        id: vendor.id,
        email: vendor.username,
      },
      redirectUrl: '/dashboard',
    });
    return;
  } catch {
    if (!res.headersSent) {
      res.status(500).json({ message: 'Internal server error' });
      return;
    }
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    // Clear any server-side session data if using sessions
    // If using JWT tokens, you could maintain a blacklist of invalidated tokens

    // For now, we'll just acknowledge the logout request
    // In a real application, you might want to:
    // 1. Clear session cookies
    // 2. Add JWT to blacklist
    // 3. Clear user-specific cache

    console.log('User logged out successfully');

    res.status(200).json({
      message: 'Logout successful',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Logout Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
