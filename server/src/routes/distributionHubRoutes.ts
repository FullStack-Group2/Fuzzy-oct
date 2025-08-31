import { Router } from 'express';
import { getDistributionHubs } from '../controllers/HubController';

const router = Router();

// GET /api/distributionHub/ - list hubs (hubName + hubLocation)
router.get('/', getDistributionHubs);

export default router;
