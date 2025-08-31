import { Request, Response } from 'express';
import DistributionHub from '../models/DistributionHub';

export async function getDistributionHubs(_req: Request, res: Response) {
  try {
    const hubs = await DistributionHub.find()
      .select('_id hubName hubLocation')
      .sort({ hubName: 1 });
    res.json(hubs);
  } catch (err) {
    console.error('getDistributionHubs error', err);
    res.status(500).json({ message: 'Failed to load distribution hubs' });
  }
}
