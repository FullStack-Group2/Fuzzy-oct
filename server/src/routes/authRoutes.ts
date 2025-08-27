import { Router } from 'express';
import * as authController from '../controllers/AuthController';
import { requireAnyRole } from '../middleware/roleMiddleware';
import { authMiddleware } from '../middleware/authMiddleware';
import {
  validateVendorRegistration,
  validateCustomerRegistration,
  validateShipperRegistration,
  validateLogin,
  validateForgotPassword,
  validateVerifyResetCode,
  validateResetPassword,
  validateChangePassword,
} from '../middleware/authValidationMiddleware';

const router = Router();

// Registration routes with validation
router.post('/register/vendor', validateVendorRegistration, authController.registerVendor);
router.post('/register/customer', validateCustomerRegistration, authController.registerCustomer);
router.post('/register/shipper', validateShipperRegistration, authController.registerShipper);

// Public routes - Authentication with validation
router.post('/login', validateLogin, authController.login);
router.post('/logout', authController.logout);
router.post('/forgot-password', validateForgotPassword, authController.forgotPassword);
router.post('/verify-otp', validateVerifyResetCode, authController.verifyResetCode);
router.post('/reset-password', validateResetPassword, authController.resetForgotPassword);
router.post(
  '/change-password/:id',
  authMiddleware,
  requireAnyRole,
  validateChangePassword,
  authController.changePassword,
);

export default router;
