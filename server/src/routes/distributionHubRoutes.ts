// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author: Truong Quoc Tri
// ID: s4010989

import { Router } from 'express';
import { getDistributionHubs } from '../controllers/HubController';

const router = Router();

router.get('/', getDistributionHubs);

export default router;
