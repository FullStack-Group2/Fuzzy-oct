import { Router } from 'express';
import customerRoutes from './customerRoutes';
import vendorRoutes from './vendorRoutes';
import authRoutes from './authRoutes';
import uploadRoutes from './uploadRoutes';
import shipperRoutes from './shipperRoutes';

const router = Router();
// this is the main router for the API
router.use('/auth', authRoutes);
router.use('/upload', uploadRoutes);
router.use('/vendors', vendorRoutes);
router.use('/customers', customerRoutes);
router.use('/shippers', shipperRoutes);
export default router;
