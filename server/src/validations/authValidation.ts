import { z } from 'zod';

// Username validation: 8-15 characters, letters and digits only
const usernameSchema = z
  .string()
  .min(8, 'Username must be at least 8 characters')
  .max(15, 'Username must not exceed 15 characters')
  .regex(/^[a-zA-Z0-9]+$/, 'Username can only contain letters and digits');

// Password validation: 8-20 characters, at least one uppercase, one lowercase, one digit, one special character (!@#$%^&*)
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(20, 'Password must not exceed 20 characters')
  .regex(/^(?=.*[a-z])/, 'Password must contain at least one lowercase letter')
  .regex(/^(?=.*[A-Z])/, 'Password must contain at least one uppercase letter')
  .regex(/^(?=.*\d)/, 'Password must contain at least one digit')
  .regex(
    /^(?=.*[!@#$%^&*])/,
    'Password must contain at least one special character (!@#$%^&*)',
  )
  .regex(
    /^[a-zA-Z0-9!@#$%^&*]+$/,
    'Password can only contain letters, digits, and special characters (!@#$%^&*)',
  );

// Email validation
const emailSchema = z
  .string()
  .email('Invalid email format')
  .min(5, 'Email must be at least 5 characters');

// Generic text field validation (minimum 5 characters)
const textFieldSchema = z
  .string()
  .min(5, 'This field must be at least 5 characters')
  .trim();

// Profile picture validation (optional)
const profilePictureSchema = z.string().optional().default('');

// Vendor registration validation schema
export const vendorRegistrationSchema = z.object({
  username: usernameSchema,
  email: emailSchema,
  password: passwordSchema,
  businessName: textFieldSchema,
  businessAddress: textFieldSchema,
  profilePicture: profilePictureSchema,
});

// Customer registration validation schema
export const customerRegistrationSchema = z.object({
  username: usernameSchema,
  email: emailSchema,
  password: passwordSchema,
  name: textFieldSchema,
  address: textFieldSchema,
  profilePicture: profilePictureSchema,
});

// Shipper registration validation schema
export const shipperRegistrationSchema = z.object({
  username: usernameSchema,
  email: emailSchema,
  password: passwordSchema,
  assignedHubId: z.string().min(1, 'Assigned hub is required'),
  profilePicture: profilePictureSchema,
});

// Login validation schema
export const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

// Forgot password validation schema
export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

// Verify reset code validation schema
export const verifyResetCodeSchema = z.object({
  email: emailSchema,
  code: z.string().min(1, 'Verification code is required'),
});

// Reset password validation schema
export const resetPasswordSchema = z.object({
  email: emailSchema,
  newPassword: passwordSchema,
  resetToken: z.string().min(1, 'Reset token is required'),
});

// Change password validation schema
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
});

// Type exports for TypeScript
export type VendorRegistrationInput = z.infer<typeof vendorRegistrationSchema>;
export type CustomerRegistrationInput = z.infer<
  typeof customerRegistrationSchema
>;
export type ShipperRegistrationInput = z.infer<
  typeof shipperRegistrationSchema
>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type VerifyResetCodeInput = z.infer<typeof verifyResetCodeSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
