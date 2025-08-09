import { Router } from 'express';
import AuthRoutes from './auth'; // Updated to use new role-based auth
import UploadRoutes from './uploadRoutes';
import VendorRoutes from './VendorRoutes';

const router = Router();
// this is the main router for the API
router.use('/auth', AuthRoutes);
router.use('/upload', UploadRoutes);
router.use('/vendors', VendorRoutes);

export default router;
