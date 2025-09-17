// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author: Pham Le Gia Huy
// ID: s3975371

import { Schema } from 'mongoose';
import DistributionHub from '../models/DistributionHub';

export const chooseHub = async () => {
  const hubs = await DistributionHub.find(); // fetch all hub
  console.log('Available hubs:', hubs);
  const randomIndex = Math.floor(Math.random() * hubs.length);

  return hubs[randomIndex]._id as Schema.Types.ObjectId;
};
