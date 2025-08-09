import { Router } from 'express';
import * as authController from '../controllers/AuthController';

const router = Router();

router.post('/register/vendor', authController.registerVendor);
router.post('/register/customer', authController.registerCustomer);
router.post('/register/shipper', authController.registerShipper);
// Public routes - Authentication
router.post('/login', authController.login);
router.post('/logout', authController.logout);

export default router;
