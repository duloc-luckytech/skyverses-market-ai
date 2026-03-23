import mongoose, { Schema, Document, Model, HydratedDocument } from "mongoose";

export interface IGoogleToken extends Document {
  email: string;
  ownerId?: mongoose.Types.ObjectId;   // ⭐ NEW
  password?: string;
  accessToken: string;
  cookieToken?: string;
  isActive: boolean;
  note: string;
  expires?: Date;
  type: "free" | "vip";
  slot: number;
  assigned: number;
  userIds: mongoose.Types.ObjectId[];

  lastUsedAt?: Date;
  isBusy?: boolean;
  successCount: number;
  errorCount: number;
  currentLoad: number;
  maxConcurrent: number;

  projectId?: string;
  projectTitle?: string;
  workflowId?: string;
  credits: number;
  codeError: string;
  lastActiveAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const GoogleTokenSchema = new Schema<IGoogleToken>(
  {
    email: { type: String, required: true },

    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },

    password: { type: String },
    accessToken: { type: String, required: true },
    cookieToken: { type: String },
    isActive: { type: Boolean, default: true },
    note: { type: String },
    expires: { type: Date },
    codeError: { type: String },

    type: {
      type: String,
      enum: ["free", "vip"],
      default: "free",
    },

    slot: { type: Number, default: 1 },
    assigned: { type: Number, default: 0 },

    userIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // tracking
    lastUsedAt: { type: Date },
    isBusy: { type: Boolean, default: false },
    successCount: { type: Number, default: 0 },
    errorCount: { type: Number, default: 0 },
    currentLoad: { type: Number, default: 0 },
    maxConcurrent: { type: Number, default: 3 },

    credits: { type: Number, default: 0 },
    projectId: { type: String },
    projectTitle: { type: String },
    lastActiveAt: { type: Date },
    workflowId: { type: String },
  },
  { timestamps: true }
);

// Index
GoogleTokenSchema.index({ isActive: 1, isBusy: 1 });
GoogleTokenSchema.index({ type: 1, assigned: 1 });
GoogleTokenSchema.index({ lastUsedAt: 1 });
GoogleTokenSchema.index({ ownerId: 1 }); // ⭐ NEW index

const GoogleToken: Model<IGoogleToken> =
  mongoose.models.GoogleToken ||
  mongoose.model<IGoogleToken>("GoogleToken", GoogleTokenSchema);

export type GoogleTokenDoc = HydratedDocument<IGoogleToken>;
export default GoogleToken;