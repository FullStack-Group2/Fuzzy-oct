// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author:
// ID:

import { Request, Response } from 'express';
import bcrypt from 'bcrypt';

import { VendorModel } from '../models/Vendor';
import { CustomerModel } from '../models/Customer';
import { ShipperModel } from '../models/Shipper';
import { UserRole } from '../models/UserRole';
import { UserServices } from '../services/UserServices';
import { createVendor } from '../services/VendorService';
import { signJWT } from '../utils/SignHelper';
import twilio from 'twilio';
import {
  deleteResetToken,
  generateResetToken,
  verifyResetToken,
} from '../utils/ResetTokenStore';
import DistributionHub from '../models/DistributionHub';
import {
  changePasswordSchema,
  customerRegistrationSchema,
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  shipperRegistrationSchema,
  vendorRegistrationSchema,
  verifyResetCodeSchema,
} from '../validations/authValidation';

interface TokenPayload {
  userId: string;
  username: string;
  role: UserRole;
  hubId?: string;
}

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN,
);

// Register Vendor
export const registerVendor = async (req: Request, res: Response) => {
  try {
    // Validate the request body using Zod schema
    const validationResult = vendorRegistrationSchema.safeParse(req.body);

    if (!validationResult.success) {
      const formattedErrors = validationResult.error.issues.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      return res.status(400).json({
        message: 'Validation failed',
        errors: formattedErrors,
      });
    }

    const {
      username,
      email,
      password,
      businessName,
      businessAddress,
      profilePicture,
    } = validationResult.data;

    // Check if username already exists
    const existingUser = await UserServices.usernameExists(username);
    if (existingUser) {
      return res.status(409).json({ message: 'Username already exists' });
    }

    // Check if a vendor with this specific businessName AND businessAddress already exists
    const existingVendor = await VendorModel.findOne({
      businessName: businessName.trim(),
      businessAddress: businessAddress.trim(),
    });
    if (existingVendor) {
      return res.status(409).json({ message: 'A vendor with this business name and address already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const vendor = await createVendor({
      username: username.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      role: UserRole.VENDOR,
      businessName: businessName.trim(),
      businessAddress: businessAddress.trim(),
      profilePicture: profilePicture || '',
    });

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
    // Validate the request body using Zod schema
    const validationResult = customerRegistrationSchema.safeParse(req.body);
    console.log('Customer registration validation result:', validationResult);
    if (!validationResult.success) {
      const formattedErrors = validationResult.error.issues.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      return res.status(400).json({
        message: 'Validation failed',
        errors: formattedErrors,
      });
    }

    const { username, email, password, name, address, profilePicture } =
      validationResult.data;

    // Check if username already exists
    const existingUser = await UserServices.usernameExists(username);
    if (existingUser) {
      return res.status(409).json({ message: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

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
    // Validate the request body using Zod schema
    const validationResult = shipperRegistrationSchema.safeParse(req.body);

    if (!validationResult.success) {
      const formattedErrors = validationResult.error.issues.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      return res.status(400).json({
        message: 'Validation failed',
        errors: formattedErrors,
      });
    }

    const { username, email, password, assignedHubId, profilePicture } =
      validationResult.data;

    // Check if username already exists
    const existingUser = await UserServices.usernameExists(username);
    if (existingUser) {
      return res.status(409).json({ message: 'Username already exists' });
    }

    const hub = await DistributionHub.findById(assignedHubId);
    if (!hub) {
      return res.status(404).json({ message: 'Assigned hub not found' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const shipper = await ShipperModel.create({
      username: username.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      role: UserRole.SHIPPER,
      distributionHub: hub._id,
      profilePicture: profilePicture || '',
    });

    // Build JWT with hubId for shipper
    const tokenPayload: TokenPayload = {
      userId: shipper.id.toString(),
      username: shipper.username,
      role: UserRole.SHIPPER,
      hubId: shipper.distributionHub?.toString(),
    };

    const token = signJWT(tokenPayload);

    res.status(201).json({
      message: 'Shipper registered successfully',
      shipper: {
        id: shipper._id,
        username: shipper.username,
        email: shipper.email,
        distributionHub: shipper.distributionHub,
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
    // Validate the request body using Zod schema
    const validationResult = loginSchema.safeParse(req.body);

    if (!validationResult.success) {
      const formattedErrors = validationResult.error.issues.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      return res.status(400).json({
        message: 'Validation failed',
        errors: formattedErrors,
      });
    }

    const { username, password } = validationResult.data;

    const user = await UserServices.findByUserName(username);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Prepare token payload (with hubId for shippers)
    let hubId: string | undefined;
    if (user.role === UserRole.SHIPPER) {
      const shipper = await ShipperModel.findById(user._id).select(
        'distributionHub',
      );
      if (shipper?.distributionHub) hubId = shipper.distributionHub.toString();
    }

    const tokenPayload: TokenPayload = {
      userId: user.id.toString(),
      username: user.username,
      role: user.role,
      ...(hubId ? { hubId } : {}),
    };
    const token = signJWT(tokenPayload);

    const userData: Record<string, unknown> = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      profilePicture: user.profilePicture,
    };

    // Attach role-specific extras (merge of HEAD + dev)
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
        const shipper = await ShipperModel.findById(user._id).select(
          'distributionHub',
        );
        if (shipper?.distributionHub)
          userData.distributionHub = shipper.distributionHub;
        break;
      }
    }

    return res
      .status(200)
      .json({ message: 'Login successful', user: userData, token });
  } catch (err) {
    console.error('Login Error:', err);
    return res.status(500).json({ message: 'Internal server error' });
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
    // Validate the request body using Zod schema
    const validationResult = forgotPasswordSchema.safeParse(req.body);

    if (!validationResult.success) {
      const formattedErrors = validationResult.error.issues.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      return res.status(400).json({
        message: 'Validation failed',
        errors: formattedErrors,
      });
    }

    const { email } = validationResult.data;

    // Check if user exists in your DB
    const user = await UserServices.findByEmail(email);
    if (!user) {
      return res.status(404).json({ message: 'Email is not registered' });
    }

    console.log(`Sending OTP to email: ${email}`);

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
        setTimeout(() => reject(new Error('OTP send timeout')), 15000),
      );

      const result = await Promise.race([verificationPromise, timeoutPromise]);

      console.log('OTP send result:', result);
      res.status(200).json({ status: 'Verification code sent successfully' });
    } catch (twilioError: unknown) {
      console.error('Twilio OTP send error:', twilioError);
      const error = twilioError as TwilioError;

      if (
        error.message === 'OTP send timeout' ||
        error.code === 'ECONNABORTED'
      ) {
        return res.status(408).json({
          message: 'Failed to send verification code. Please try again',
        });
      }

      return res.status(500).json({
        message: 'Failed to send verification code. Please try again later',
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
    // Validate the request body using Zod schema
    const validationResult = verifyResetCodeSchema.safeParse(req.body);

    if (!validationResult.success) {
      const formattedErrors = validationResult.error.issues.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      return res.status(400).json({
        message: 'Validation failed',
        errors: formattedErrors,
      });
    }

    const { email, code } = validationResult.data;

    console.log(`Attempting to verify OTP for email: ${email}, code: ${code}`);

    let verificationCheck: TwilioVerificationCheck;
    try {
      const verificationPromise = client.verify.v2
        .services(process.env.TWILIO_VERIFY_SERVICE_SID!)
        .verificationChecks.create({
          to: email,
          code: code.toString(),
        });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Verification timeout')), 15000),
      );

      verificationCheck = await Promise.race([
        verificationPromise,
        timeoutPromise,
      ]);
    } catch (twilioError: unknown) {
      console.error('Twilio verification error:', twilioError);

      const error = twilioError as TwilioError;

      if (error.code === 20404) {
        return res.status(400).json({
          message: 'Verification code has expired or is invalid',
        });
      }

      if (
        error.message === 'Verification timeout' ||
        error.code === 'ECONNABORTED'
      ) {
        return res.status(408).json({
          message:
            'Verification service is temporarily unavailable. Please try again',
        });
      }

      return res.status(500).json({
        message:
          'Failed to verify code. Please try again or request a new code',
      });
    }

    console.log('Verification check result:', verificationCheck);

    if (verificationCheck.status !== 'approved') {
      return res.status(400).json({
        message: 'Invalid or expired verification code',
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
      message: 'Internal server error. Please try again later',
    });
  }
};

export const resetForgotPassword = async (req: Request, res: Response) => {
  try {
    // Validate the request body using Zod schema
    const validationResult = resetPasswordSchema.safeParse(req.body);

    if (!validationResult.success) {
      const formattedErrors = validationResult.error.issues.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      return res.status(400).json({
        message: 'Validation failed',
        errors: formattedErrors,
      });
    }

    const { email, newPassword, resetToken } = validationResult.data;

    // Verify the reset token
    if (!verifyResetToken(email, resetToken)) {
      return res
        .status(400)
        .json({ message: 'Invalid or expired reset token' });
    }

    const user = await UserServices.findByEmail(email);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const result = await UserServices.updatePassword(user.id, newPassword);
    console.log('Password reset result:', result);

    deleteResetToken(email);

    res.status(200).json({ status: 'Password reset successful' });
  } catch (error) {
    console.error('Reset Password Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;

    const user = await UserServices.findByIdWithPassword(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Validate the request body using Zod schema
    const validationResult = changePasswordSchema.safeParse(req.body);

    if (!validationResult.success) {
      const formattedErrors = validationResult.error.issues.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      return res.status(400).json({
        message: 'Validation failed',
        errors: formattedErrors,
      });
    }

    const { currentPassword, newPassword } = validationResult.data;

    // Check if password field exists
    if (!user.password) {
      console.error('User password field is missing');
      return res
        .status(500)
        .json({ message: 'User authentication data is corrupted' });
    }

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );
    console.log('Is current password valid:', isPasswordValid);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    const result = await UserServices.updatePassword(userId, newPassword);
    console.log('Password change result:', result);

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change Password Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
