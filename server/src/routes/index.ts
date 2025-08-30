import { Router } from 'express';

// Keep import names consistent (all lowerCamelCase)
import authRoutes from './authRoutes';
import uploadRoutes from './uploadRoutes';
import vendorRoutes from './vendorRoutes';
import customerRoutes from './customerRoutes';
import shipperRoutes from './shipperRoutes';

// Hubs: file name diverged across branches
// - HEAD: './distributionHubRoutes'
// - dev : './hubRoutes'
// Prefer the shorter 'hubRoutes' module; if your project actually exports from
// 'distributionHubRoutes', you can re-export from 'hubRoutes.ts' to keep this import stable.
import hubRoutes from './hubRoutes';

const router = Router();

// Core
router.use('/auth', authRoutes);
router.use('/upload', uploadRoutes);

// Preferred RESTful, pluralized mounts (dev)
router.use('/vendors', vendorRoutes);
router.use('/customers', customerRoutes);
router.use('/shippers', shipperRoutes);
router.use('/hubs', hubRoutes);
router.use('/distributionHub', hubRoutes);           // legacy
router.use('/products', vendorRoutes);               // legacy: product endpoints lived under vendor

export default router;
