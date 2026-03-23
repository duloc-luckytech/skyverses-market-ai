import mongoose, { Schema } from "mongoose";

const videoJobSchema = new mongoose.Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    projectId: { type: Schema.Types.ObjectId, ref: "Project", index: true },
    prompt: { type: String, required: true },
    duration: { type: Number, default: 8 },
    resolution: { type: String, default: "720p" },
    aspectRatio: { type: String, default: "16:9" },
    generateAudio: { type: Boolean, default: true },
    projectName: { type: String, index: true },
    sceneIndex: { type: Number, default: 0 },
    promptSlug: { type: String },
    type: {
      type: String,
      enum: [
        "text",
        "scene",
        "start-image",
        "start-image-redirect",
        "start-end-image",
        "start-end-image-redirect",
        "text-for-extend",
        "extend-to-video",
        "multi-scene-initial",
        "multi-scene-extend",
      ],
      default: "text",
    },

    listIdImage: [{ type: String }],
    images: [{ type: String }],

    status: {
      type: String,
      enum: [
        "pending",
        "queued",
        "processing",
        "done",
        "error",
        "reject",
        "submitting",
        "blocked",
        "partial",
      ],
      default: "pending",
    },
    quantity: { type: Number, default: 1 },
    progress: { type: Number, default: 0 },
    operationName: { type: String }, // 🔵 Google Labs
    taskId: { type: String, index: true }, // 🟣 WAN (DashScope)
    recaptchaToken: { type: String },
    fileUrl: { type: String },
    previousJobId: { type: String },
    sceneId: { type: String },
    errorCount: { type: Number, default: 0 },
    errorMessage: { type: Object },
    errorReason: { type: String },
    errorSceneId: { type: String },
    errorStartedAt: { type: Date },

    source: { type: String, default:'labs' }, // gommo
    mode: { type: String },
    model: { type: String },

    didUpsample1080p: { type: Boolean, default: false },

    charged: { type: Boolean, default: false },
    chargedAt: { type: Date },

    vipLevel: { type: Number, default: 0 },
    sentByEmail: { type: String },
    sentProcessAt: { type: Date },
    listOperations: [{ type: Object }],
    results: [{ type: Object }],
    listMediaExtend: [
      {
        mediaId: { type: String },
        fileUrl: { type: String },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    sentTokenId: { type: String },
    mediaExtendId: { type: String },
    mediaIdInputExtend: { type: String },
    mediaVideoId: { type: String },
    freeCredit: { type: Boolean, default: false },
    groupName: { type: String },
    startTime: { type: String, default: "0s" },
    endTime: { type: String, default: "8s" },

    size: { type: String },
  },
  { timestamps: true }
);

/* ======================================================
 *  ⭐ INDEX TỐI ƯU HÓA HIỆU NĂNG TOÀN HỆ THỐNG
 * ====================================================== */

// --- Core filtering ---
videoJobSchema.index({ userId: 1 });
videoJobSchema.index({ type: 1 });
videoJobSchema.index({ status: 1 });
videoJobSchema.index({ createdAt: 1 });

// --- Combo indexes (cực mạnh cho statistic + chart) ---
videoJobSchema.index({ userId: 1, createdAt: 1 });
videoJobSchema.index({ type: 1, createdAt: 1 });
videoJobSchema.index({ status: 1, createdAt: 1 });
videoJobSchema.index({ userId: 1, type: 1, status: 1 });

// --- Project browsing ---
videoJobSchema.index({ projectName: 1, createdAt: -1 });

// --- Multi-scene cron optimization ---
videoJobSchema.index({ status: 1, updatedAt: 1 });

// --- Scan pending jobs, retries ---
videoJobSchema.index({ status: 1, errorCount: 1 });

// --- Improve search by operationName (Google Labs job id) ---
videoJobSchema.index({ operationName: 1 });
videoJobSchema.index({ taskId: 1 }); // WAN

// --- Extend batch lookups ---
videoJobSchema.index({ mediaIdInputExtend: 1 });
videoJobSchema.index({ mediaVideoId: 1 });

videoJobSchema.index({ promptSlug: 1 });
export default mongoose.model("VideoJob", videoJobSchema);
