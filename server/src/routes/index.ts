import { Router } from 'express';

import authRoutes from './authRoutes';
import uploadRoutes from './uploadRoutes';
import shipperRoutes from './shipperRoutes';
// Hubs: file name diverged across branches
// - HEAD: './distributionHubRoutes'
// - dev : './hubRoutes'
// Prefer the shorter 'hubRoutes' module; if your project actually exports from
// 'distributionHubRoutes', you can re-export from 'hubRoutes.ts' to keep this import stable.
import hubRoutes from './hubRoutes';
import customerRoutes from './customerRoutes';
import vendorRoutes from './vendorRoutes';
import aiRoutes from './aiRoutes';

const router = Router();

// Core
router.use('/auth', authRoutes);
router.use('/upload', uploadRoutes);

router.use('/vendors', vendorRoutes);
router.use('/customers', customerRoutes);
router.use('/shippers', shipperRoutes);
router.use('/hubs', hubRoutes);
router.use('/ai', aiRoutes);
router.use('/distributionHub', hubRoutes); // legacy
router.use('/products', vendorRoutes); // legacy: product endpoints lived under vendor

export default router;
