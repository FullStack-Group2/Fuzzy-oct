import { Router } from 'express';
import vendorRoutes from './vendorRoutes';
import authRoutes from './authRoutes';
import uploadRoutes from './uploadRoutes';
import shipperRoutes from './shipperRoutes';
import hubRoutes from './hubRoutes';
import customerRoutes from './CustomerRoutes';

const router = Router();
// this is the main router for the API
router.use('/auth', authRoutes);
router.use('/upload', uploadRoutes);
router.use('/vendors', vendorRoutes);
router.use('/customers', customerRoutes);
router.use('/shippers', shipperRoutes);
router.use('/hubs', hubRoutes);

export default router;
