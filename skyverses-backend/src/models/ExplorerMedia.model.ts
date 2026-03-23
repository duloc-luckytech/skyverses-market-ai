import mongoose, { Schema, Document, Types, Model } from "mongoose";

/* =====================================================
     ENUM TYPES
  ===================================================== */
export type ExplorerMediaStatus = "pending" | "approved" | "rejected";

export type ExplorerMediaType =
  | "image"
  | "video"
  | "prompt"
  | "game_asset"
  | "game_asset_3d";

/* =====================================================
     ATTRIBUTES (PURE DATA)
  ===================================================== */
export interface ExplorerMediaAttrs {
  title: string;
  description?: string;

  type: ExplorerMediaType;

  thumbnailUrl: string;
  mediaUrl: string;

  tags?: string[];
  categories?: string[];

  author: Types.ObjectId;
  authorName?: string;

  engine?: string;
  modelKey?: string;
  resolution?: string;

  seed?: number;
  meta?: Record<string, any>;

  status?: ExplorerMediaStatus;

  approvedBy?: Types.ObjectId;
  approvedAt?: Date;
  rejectedReason?: string;
  prompt?: string;

  views?: number;
  likes?: number;
}

/* =====================================================
     DOCUMENT TYPE
  ===================================================== */
export interface ExplorerMediaDoc extends Document, ExplorerMediaAttrs {
  createdAt: Date;
  updatedAt: Date;
}

/* =====================================================
     SCHEMA
  ===================================================== */
const ExplorerMediaSchema = new Schema<ExplorerMediaDoc>(
  {
    title: { type: String, required: true },
    description: String,

    type: {
      type: String,
      enum: ["image", "video", "prompt", "game_asset", "game_asset_3d"],
      required: true,
      index: true,
    },

    thumbnailUrl: {
      type: String,
      required: true,
    },

    mediaUrl: {
      type: String,
      required: true,
    },

    tags: {
      type: [String],
      default: [],
      index: true,
    },

    categories: {
      type: [String],
      default: [],
      index: true,
    },

    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    authorName: String,
    prompt: String,
    engine: String,
    modelKey: String,
    resolution: String,
    seed: Number,

    meta: Schema.Types.Mixed,

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },

    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    approvedAt: Date,
    rejectedReason: String,

    views: {
      type: Number,
      default: 0,
      index: true,
    },

    likes: {
      type: Number,
      default: 0,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

/* =====================================================
     MODEL
  ===================================================== */
const ExplorerMedia: Model<ExplorerMediaDoc> =
  mongoose.models.ExplorerMedia ||
  mongoose.model<ExplorerMediaDoc>("ExplorerMedia", ExplorerMediaSchema);

ExplorerMediaSchema.index(
  { type: 1, "meta.normalizedPrompt": 1 },
  { unique: true, sparse: true }
);
export default ExplorerMedia;
