import mongoose, { Schema, Document } from "mongoose";

/* ================================
   ENUMS
================================ */
export enum ImageJobStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  DONE = "done",
  ERROR = "error",
  REJECT = "reject",
  CANCELLED = "cancelled",
  POLLING = "polling",
  CAPCHA = "capcha",
}

export enum ImageJobType {
  TEXT_TO_IMAGE = "text_to_image",
  IMAGE_TO_IMAGE = "image_to_image",
  IMAGE_VARIATION = "image_variation",
  IMAGE_UPSCALE = "image_upscale",
  IMAGE_EDIT = "image_edit",
}

export enum ImageEngineProvider {
  GEMINI = "gemini",
  WAN = "wan",
  VEO = "veo",
  GOMMO = "gommo",
  MIDJOURNEY = "midjourney",
  RUNNING = "running",
  STABLE_DIFFUSION = "stable_diffusion",
  LEONARDO = "leonardo",
  FXLAB = "fxlab",
  FXFLOW = "fxflow",
}

/* ================================
   INTERFACE
================================ */
export interface IImageJob extends Document {
  userId: Schema.Types.ObjectId;

  type: ImageJobType;
  status: ImageJobStatus;

  /* ---------- INPUT ---------- */
  input: {
    prompt?: string;
    negativePrompt?: string;

    image?: string; // main image
    images?: string[]; // multi-input
    mask?: string; // for edit/inpaint
    referenceImage?: string; // style / reference
  };

  recaptchaToken?: string;
  /* ---------- CONFIG ---------- */
  config: {
    width?: number;
    height?: number;
    aspectRatio?: string; // 1:1 | 16:9 | 9:16
    steps?: number;
    guidanceScale?: number;
    seed?: number;
    style?: string;
    batchSize?: number;
  };

  /* ---------- ENGINE ---------- */
  engine: {
    provider: ImageEngineProvider;
    model: string;
    version?: string;
  };

  /* ---------- ENGINE PASSTHROUGH ---------- */
  enginePayload?: any; // raw payload sent to engine
  engineResponse?: any; // raw response / poll data

  /* ---------- RESULT ---------- */
  result?: {
    images?: string[]; // output image URLs
    thumbnail?: string; // first image
    imageId?: string; // first image
    width?: number;
    height?: number;
  };

  /* ---------- PROGRESS ---------- */
  progress?: {
    percent: number;
    step?: string;
  };

  finalPayload: any;
  /* ---------- ERROR ---------- */
  error?: {
    message: string;
    raw?: any;
  };

  /* ---------- BILLING ---------- */
  creditsUsed?: number;

  /* ---------- POLLING ---------- */
  pollStartedAt?: number; // ⭐ timestamp (Date.now)

  /* ---------- FALLBACK ---------- */
  failedEngines?: string[]; // engines that have timed out / failed

  /* ---------- FXFLOW OWNER ---------- */
  owner?: string;

  createdAt: Date;
  updatedAt: Date;
}

/* ================================
   SCHEMA
================================ */
const ImageJobSchema = new Schema<IImageJob>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },

    type: {
      type: String,
      enum: Object.values(ImageJobType),
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: Object.values(ImageJobStatus),
      default: ImageJobStatus.PENDING,
      index: true,
    },

    /* ---------- INPUT ---------- */
    input: {
      prompt: String,
      negativePrompt: String,
      image: String,
      images: [String],
      mask: String,
      referenceImage: String,
    },

    /* ---------- CONFIG ---------- */
    config: {
      width: Number,
      height: Number,
      aspectRatio: String,
      steps: Number,
      guidanceScale: Number,
      seed: Number,
      style: String,
      batchSize: { type: Number, default: 1 },
    },
    finalPayload: Schema.Types.Mixed,
    recaptchaToken: String,
    /* ---------- ENGINE ---------- */
    engine: {
      provider: {
        type: String,
        enum: Object.values(ImageEngineProvider),
        required: true,
      },
      model: { type: String, required: true },
      version: String,
    },

    enginePayload: Schema.Types.Mixed,
    engineResponse: Schema.Types.Mixed,

    /* ---------- RESULT ---------- */
    result: {
      images: [String],
      thumbnail: String,
      imageId: String,
      width: Number,
      height: Number,
    },

    /* ---------- PROGRESS ---------- */
    progress: {
      percent: { type: Number, default: 0 },
      step: String,
    },

    /* ---------- ERROR ---------- */
    error: {
      message: String,
      raw: Schema.Types.Mixed,
    },

    creditsUsed: { type: Number, default: 0 },

    /* ---------- FXFLOW OWNER ---------- */
    owner: { type: String, default: null, index: true },

    pollStartedAt: Number, // ⭐ timestamp

    /* ---------- FALLBACK ---------- */
    failedEngines: { type: [String], default: [] },
  },
  { timestamps: true }
);

/* ================================
   INDEXES
================================ */
ImageJobSchema.index({ userId: 1, createdAt: -1 });
ImageJobSchema.index({ status: 1, type: 1 });

export default mongoose.model<IImageJob>("ImageJob", ImageJobSchema);
