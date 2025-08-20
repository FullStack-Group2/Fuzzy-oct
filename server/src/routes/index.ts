import { Router } from 'express';
import AuthRoutes from './authRoutes';
import UploadRoutes from './uploadRoutes';
import VendorRoutes from './VendorRoutes';
import CustomerRoutes from './CustomerRoutes';

const router = Router();
// this is the main router for the API
router.use('/auth', AuthRoutes);
router.use('/upload', UploadRoutes);
router.use('/vendors', VendorRoutes);
router.use('/customer', CustomerRoutes);
router.use('/products', VendorRoutes);
export default router;
