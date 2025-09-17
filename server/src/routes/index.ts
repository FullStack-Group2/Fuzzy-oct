// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author: Pham Le Gia Huy, Truong Quoc Tri
// ID: s3975371, s4010989

import { Router } from 'express';

import authRoutes from './authRoutes';
import uploadRoutes from './uploadRoutes';
import shipperRoutes from './shipperRoutes';
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
