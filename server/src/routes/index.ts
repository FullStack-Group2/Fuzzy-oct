import { Router } from 'express';

import authRoutes from './authRoutes';
import uploadRoutes from './uploadRoutes';
import shipperRoutes from './shipperRoutes';
import hubRoutes from './hubRoutes';
import customerRoutes from './customerRoutes';
import vendorRoutes from './vendorRoutes';
import aiRoutes from './aiRoutes';

const router = Router();
// this is the main router for the API
router.use('/auth', authRoutes);
router.use('/upload', uploadRoutes);
router.use('/vendors', vendorRoutes);
router.use('/customers', customerRoutes);
router.use('/shippers', shipperRoutes);
router.use('/hubs', hubRoutes);
router.use('/ai', aiRoutes);

export default router;
