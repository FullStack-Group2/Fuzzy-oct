import { Router } from 'express';
import * as authController from '../controllers/AuthController';

const router = Router();

router.post('/register/vendor', authController.registerVendor);
router.post('/login', authController.login);

export default router;
