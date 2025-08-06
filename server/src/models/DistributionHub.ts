import { Schema, model, Document } from 'mongoose';

export interface IDistributionHub extends Document {
  hubName: string;
  hubLocation: string;
}

const DistributionHubSchema = new Schema<IDistributionHub>({
  hubName: { type: String, required: true },
  hubLocation: { type: String, required: true },
});

export default model<IDistributionHub>(
  'DistributionHub',
  DistributionHubSchema,
);
