import { Router } from 'express';
import AuthRoutes from './authRoutes';
import UploadRoutes from './uploadRoutes';
import VendorRoutes from './vendorRoutes';
import shipperRoutes from './shipperRoutes';
import distributionHubRoutes from './distributionHubRoutes';
import CustomerRoutes from './customerRoutes';

const router = Router();
// this is the main router for the API
router.use('/auth', AuthRoutes);
router.use('/upload', UploadRoutes);
router.use('/vendor', VendorRoutes);
router.use('/customer', CustomerRoutes);
router.use('/products', VendorRoutes);
router.use('/shipper', shipperRoutes);
router.use('/distributionHub', distributionHubRoutes);

export default router;