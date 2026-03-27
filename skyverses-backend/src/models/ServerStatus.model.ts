import mongoose, { Schema, Document } from "mongoose";

/**
 * SERVER STATUS — Trạng thái live/off cho từng engine server
 * Admin toggle trên CMS Pricing tab
 */
export interface IServerStatus extends Document {
  engine: string; // "gommo" | "fxflow"
  isLive: boolean;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ServerStatusSchema = new Schema<IServerStatus>(
  {
    engine: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    isLive: {
      type: Boolean,
      default: true,
    },
    updatedBy: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IServerStatus>(
  "ServerStatus",
  ServerStatusSchema
);
