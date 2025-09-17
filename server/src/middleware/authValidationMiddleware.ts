// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author: Pham Le Gia Huy
// ID: s3975371

import { validateBody } from '../middleware/validation';
import {
  vendorRegistrationSchema,
  customerRegistrationSchema,
  shipperRegistrationSchema,
  loginSchema,
  forgotPasswordSchema,
  verifyResetCodeSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from '../validations/authValidation';

// Export validation middleware functions
export const validateVendorRegistration = validateBody(
  vendorRegistrationSchema,
);
export const validateCustomerRegistration = validateBody(
  customerRegistrationSchema,
);
export const validateShipperRegistration = validateBody(
  shipperRegistrationSchema,
);
export const validateLogin = validateBody(loginSchema);
export const validateForgotPassword = validateBody(forgotPasswordSchema);
export const validateVerifyResetCode = validateBody(verifyResetCodeSchema);
export const validateResetPassword = validateBody(resetPasswordSchema);
export const validateChangePassword = validateBody(changePasswordSchema);
