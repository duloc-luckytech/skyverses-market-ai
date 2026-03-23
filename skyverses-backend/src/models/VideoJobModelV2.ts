import mongoose, { Schema, Document } from "mongoose";

/* ================================
   ENUMS
================================ */
export enum VideoJobStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  DONE = "done",
  ERROR = "error",
  REJECT = "reject",
  CANCELLED = "cancelled",
  POLLING = "polling",
  CAPCHA = "capcha",
}

export enum VideoJobType {
  SWAP_CHARACTER = "swap-character",
  IMAGE_TO_ANIMATION = "image-to-animation",
  TEXT_TO_MUSIC = "text-to-music",
  TEXT_TO_VIDEO = "text-to-video",
  IMAGE_TO_VIDEO = "image-to-video",
  START_END_IMAGE = "start-end-image",
  VIDEO_EXTEND = "video-extend",
  INGREDIENT = "ingredient",
}

export enum VideoEngineProvider {
  VEO = "veo",
  GOMMO = "gommo",
  KLING = "kling",
  FXLAB = "fxlab",
  WAN = "wan",
}

/* ================================
   INTERFACE
================================ */
export interface IVideoJob extends Document {
  userId: Schema.Types.ObjectId;

  type: VideoJobType;
  status: VideoJobStatus;

  input: {
    prompt?: string;
    images?: string[];
    videos?: string[];
    startImage?: string;
    endImage?: string;
    referenceVideo?: string;
    audio?: string;
  };

  config: {
    duration: number;
    aspectRatio: string;
    fps?: number;
    resolution?: string;
    seed?: number;
    style?: string;
  };

  recaptchaToken?: string;
  executor?: string;
  engine: {
    provider: VideoEngineProvider;
    model: string;
    version?: string;
  };

  enginePayload?: any;
  engineResponse?: any;

  result?: {
    audioUrl?: string;
    videoUrl?: string;
    thumbnailUrl?: string;
  };

  progress?: {
    percent: number;
    step?: string;
  };

  /** ⭐ ERROR CHUẨN PRO */
  error?: {
    stage?: "request" | "poll";
    provider?: VideoEngineProvider;

    code?: string; // ENGINE_TIMEOUT, PUBLIC_ERROR_AUDIO_FILTERED, ...
    message?: string; // message kỹ thuật
    userMessage?: string; // message hiển thị user ⭐

    raw?: any; // raw từ engine
  };

  creditsUsed?: number;

  pollStartedAt?: Date;

  /* ---------- FALLBACK ---------- */
  failedEngines?: string[];

  refundedAt?: Date;
  refundReason: string;

  createdAt: Date;
  updatedAt: Date;
}

/* ================================
   SCHEMA
================================ */
const VideoJobSchema = new Schema<IVideoJob>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },

    type: {
      type: String,
      enum: Object.values(VideoJobType),
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: Object.values(VideoJobStatus),
      default: VideoJobStatus.PENDING,
      index: true,
    },

    input: {
      prompt: String,
      images: [String],
      videos: [String],
      startImage: String,
      endImage: String,
      referenceVideo: String,
      audio: String,
    },

    config: {
      duration: { type: Number },
      aspectRatio: { type: String, default: "16:9" },
      fps: Number,
      resolution: { type: String, default: "720p" },
      seed: Number,
      style: String,
    },

    recaptchaToken: String,
    executor: String,

    engine: {
      provider: {
        type: String,
        enum: Object.values(VideoEngineProvider),
        required: true,
      },
      model: { type: String, required: true },
      version: String,
    },

    enginePayload: Schema.Types.Mixed,
    engineResponse: Schema.Types.Mixed,

    result: {
      videoUrl: String,
      audioUrl: String,
      thumbnailUrl: String,
    },

    progress: {
      percent: { type: Number, default: 0 },
      step: String,
    },

    /** ⭐ ERROR OBJECT MỞ RỘNG */
    error: {
      stage: {
        type: String,
        enum: ["request", "poll"],
      },
      provider: {
        type: String,
        enum: Object.values(VideoEngineProvider),
      },
      code: String,
      message: String,
      userMessage: String,
      raw: Schema.Types.Mixed,
    },

    refundedAt: Date,
    refundReason: String,
    creditsUsed: { type: Number, default: 0 },
    pollStartedAt: Date,

    /* ---------- FALLBACK ---------- */
    failedEngines: { type: [String], default: [] },
  },
  { timestamps: true }
);

/* ================================
   INDEXES
================================ */
VideoJobSchema.index({ userId: 1, createdAt: -1 });
VideoJobSchema.index({ status: 1, type: 1 });
VideoJobSchema.index({ "error.code": 1 });
VideoJobSchema.index({ "engine.provider": 1 });

export default mongoose.model<IVideoJob>("VideoJobV2", VideoJobSchema);
