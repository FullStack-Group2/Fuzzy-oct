import { Request, Response } from 'express';
import bcrypt from 'bcrypt';

import { VendorModel } from '../models/Vendor';
import { CustomerModel } from '../models/Customer';
import { ShipperModel } from '../models/Shipper';
import { UserRole } from '../models/UserRole';
import { UserServices } from '../services/UserServices';
import { signJWT } from '../utils/SignHelper';
import twilio from 'twilio';
import {
  deleteResetToken,
  generateResetToken,
  verifyResetToken,
} from '../utils/ResetTokenStore';
import DistributionHub from '../models/DistributionHub';

interface TokenPayload {
  userId: string;
  username: string;
  role: UserRole;
}
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN,
);
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
          'Username, email, password, business name, and business address are required',
      });
    }

    // Check if username already exists
    const existingUser = await UserServices.usernameExists(username);
    if (existingUser) {
      return res.status(409).json({ message: 'Username already exists' });
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
    const { username, email, password, name, address, profilePicture } =
      req.body;

    if (!username || !email || !password || !name || !address) {
      return res.status(400).json({
        message: 'Username, email, password, name, and address are required',
      });
    }

    // Check if username already exists
    const existingUser = await UserServices.usernameExists(username);
    if (existingUser) {
      return res.status(409).json({ message: 'Username already exists' });
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
    const { username, email, password, assignedHubId, profilePicture } = req.body;

    if (!username || !email || !password || !assignedHubId) {
      return res.status(400).json({
        message: 'Username, email, password, and assigned hub are required',
      });
    }

    // Check if username already exists
    const existingUser = await UserServices.usernameExists(username);
    if (existingUser) {
      return res.status(409).json({ message: 'Username already exists' });
    }
    const hub = await DistributionHub.findById(assignedHubId);
    if (!hub) {
      return res.status(404).json({ message: "Assigned hub not found" });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create shipper
    const shipper = new ShipperModel({
      username: username.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      role: UserRole.SHIPPER,
      assignedHub: hub._id,
      profilePicture: profilePicture || '',
    });

    await shipper.save();

    // Populate hub details for response
    await shipper.populate('assignedHub', 'hubName hubLocation');

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
        message: 'Username and password are required',
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
      res.status(401).json({ message: 'Invalid credentials' });
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
          'hubName hubLocation'
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
      return res.status(400).json({ message: 'Email is required' });
    }

    // Check if user exists in your DB
    const user = await UserServices.findByEmail(email);
    if (!user) {
      return res.status(404).json({ message: 'Email is not registered' });
    }

    console.log(`Sending OTP to email: ${email}`);

    // Send OTP via Twilio Verify with timeout
    try {
      const verificationPromise = client.verify.v2
        .services(process.env.TWILIO_VERIFY_SERVICE_SID!)
        .verifications.create({
          channel: 'email',
          channelConfiguration: {
            template_id: 'd-2a11adc42d924c07b8ca411243c19913',
            from: 'huygiasg004@gmail.com',
            from_name: 'Fuzzy Support',
          },
          to: email,
        });

      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('OTP send timeout')), 15000)
      );

      const result = await Promise.race([
        verificationPromise,
        timeoutPromise
      ]);

      console.log('OTP send result:', result);
      res.status(200).json({ status: 'Verification code sent successfully' });
    } catch (twilioError: unknown) {
      console.error('Twilio OTP send error:', twilioError);
      const error = twilioError as TwilioError;
      
      if (error.message === 'OTP send timeout' || error.code === 'ECONNABORTED') {
        return res.status(408).json({ 
          message: 'Failed to send verification code. Please try again' 
        });
      }
      
      return res.status(500).json({ 
        message: 'Failed to send verification code. Please try again later' 
      });
    }
  } catch (error) {
    console.error('Forgot Password Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
interface TwilioError {
  message?: string;
  code?: string | number;
}

interface TwilioVerificationCheck {
  status: string;
  sid?: string;
}

export const verifyResetCode = async (req: Request, res: Response) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ message: 'Email and code are required' });
    }

    console.log(`Attempting to verify OTP for email: ${email}, code: ${code}`);

    // Add timeout and retry logic
    let verificationCheck: TwilioVerificationCheck;
    try {
      const verificationPromise = client.verify.v2
        .services(process.env.TWILIO_VERIFY_SERVICE_SID!)
        .verificationChecks.create({ 
          to: email, 
          code: code.toString() // Ensure code is string
        });

      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Verification timeout')), 15000)
      );

      verificationCheck = await Promise.race([
        verificationPromise,
        timeoutPromise
      ]);
    } catch (twilioError: unknown) {
      console.error('Twilio verification error:', twilioError);
      
      const error = twilioError as TwilioError;
      
      // Handle specific Twilio errors
      if (error.code === 20404) {
        return res.status(400).json({ 
          message: 'Verification code has expired or is invalid' 
        });
      }
      
      if (error.message === 'Verification timeout' || error.code === 'ECONNABORTED') {
        return res.status(408).json({ 
          message: 'Verification service is temporarily unavailable. Please try again' 
        });
      }
      
      return res.status(500).json({ 
        message: 'Failed to verify code. Please try again or request a new code' 
      });
    }

    console.log('Verification check result:', verificationCheck);

    if (verificationCheck.status !== 'approved') {
      return res.status(400).json({ 
        message: 'Invalid or expired verification code' 
      });
    }

    const resetToken = generateResetToken(email);
    console.log('Generated reset token:', resetToken);

    res.status(200).json({
      status: 'Code verified successfully',
      resetToken,
    });
  } catch (error) {
    console.error('Verify Code Error:', error);
    res.status(500).json({ 
      message: 'Internal server error. Please try again later' 
    });
  }
};

export const resetForgotPassword = async (req: Request, res: Response) => {
  try {
    const { email, newPassword, resetToken } = req.body;
    if (!email || !newPassword) {
      return res
        .status(400)
        .json({ message: 'Email and new password are required' });
    }
    // Verify the reset token
    if (!verifyResetToken(email, resetToken)) {
      return res
        .status(400)
        .json({ message: 'Invalid or expired reset token' });
    }
    const result = await UserServices.updatePassword(email, newPassword);

    console.log('Password reset result:', result);
    //  Delete token so it can't be reused
    deleteResetToken(email);
    res.status(200).json({ status: 'Password reset successful' });
  } catch (error) {
    console.error('Reset Password Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    const { email, currentPassword, newPassword } = req.body;
    if (!email || !currentPassword || !newPassword) {
      return res.status(400).json({
        message: 'Email, current password, and new password are required',
      });
    }

    // Find user by email
    const user = await UserServices.findByEmail(email);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ message: 'Current password is incorrect' });
    }

    // Update password in database
    await UserServices.updatePassword(email, newPassword);

    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset Password Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
