import { Router } from 'express';
import AuthRoutes from './authRoutes';
import UploadRoutes from './UploadRoutes';

const router = Router();
// this is the main router for the API
router.use('/auth', AuthRoutes);
router.use('/upload', UploadRoutes);

export default router;
