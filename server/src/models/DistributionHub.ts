import { Schema, model, Document } from 'mongoose';
import { HubTypes } from './HubTypes';

export interface IDistributionHub extends Document {
  hubName: HubTypes;
  hubLocation: string;
}

const DistributionHubSchema = new Schema<IDistributionHub>({
  hubName: { type: String, enum: Object.values(HubTypes), required: true },
  hubLocation: { type: String, required: true },
});

export default model<IDistributionHub>(
  'DistributionHub',
  DistributionHubSchema,
);
