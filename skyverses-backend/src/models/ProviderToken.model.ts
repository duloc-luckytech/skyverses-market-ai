// models/ProviderToken.model.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IProviderToken extends Document {
  provider: "labs" | "wan";

  // chung
  isActive: boolean;
  ownerId?: mongoose.Types.ObjectId | null;
  plan?: string;
  note?: string;

  // labs only
  email?: string;
  accessToken?: string;
  cookieToken?: string;

  // wan only
  apiKey?: string;

  // runtime
  lastActiveAt?: Date;
  errorCount?: number;
  cooldownUntil?: Date;
  expires?: Date;
  credits?: Number;

  createdAt: Date;
  updatedAt: Date;
}

const ProviderTokenSchema = new Schema<IProviderToken>(
  {
    provider: {
      type: String,
      enum: ["labs", "wan", "gommo"],
      required: true,
      index: true,
    },

    isActive: { type: Boolean, default: true, index: true },
    ownerId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    plan: { type: String },
    note: { type: String },

    // LABS
    email: { type: String },
    accessToken: { type: String },
    cookieToken: { type: String },
    expires: { type: Date },
    credits: { type: Number, default: 0 },

    // WAN
    apiKey: { type: String },

    // runtime
    lastActiveAt: { type: Date },
    errorCount: { type: Number, default: 0 },
    cooldownUntil: { type: Date },
  },
  { timestamps: true }
);

ProviderTokenSchema.index({ provider: 1, isActive: 1 });
ProviderTokenSchema.index({ provider: 1, ownerId: 1 });

export default mongoose.model<IProviderToken>(
  "ProviderToken",
  ProviderTokenSchema
);