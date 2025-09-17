// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author: Le Nguyen Khuong Duy
// ID: s402664

import { model, Schema } from 'mongoose';

export interface IChatSchema extends Document {
  receiverId: Schema.Types.ObjectId;
  senderId: Schema.Types.ObjectId;
  message: string;
  createdAt: Date;
}
const ChatSchema = new Schema<IChatSchema>({
  senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  receiverId: { type: Schema.Types.ObjectId, ref: 'User', required: true },

  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});
export const ChatModel = model<IChatSchema>('Chat', ChatSchema);
