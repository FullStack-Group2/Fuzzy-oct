import { Router } from 'express';
import AuthRoutes from './authRoutes';
import UploadRoutes from './uploadRoutes';
import VendorRoutes from './VendorRoutes';
import productRoutes from './productRoutes';


const router = Router();
// this is the main router for the API
router.use('/auth', AuthRoutes);
router.use('/upload', UploadRoutes);
router.use('/vendors', VendorRoutes);
router.use('/customer', VendorRoutes);
router.use('/products', VendorRoutes);
router.use('/products', productRoutes);

export default router;