import mongoose, { Schema, Document } from "mongoose";

/* ================================
   ENUMS
================================ */
export enum EditImageJobStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  DONE = "done",
  ERROR = "error",
  CANCELLED = "cancelled",
}

export type EditType = "crop" | "draw";

/* ================================
   INTERFACE
================================ */
export interface IEditImageJob extends Document {
  // ── WHO ──
  userId?: Schema.Types.ObjectId;   // optional (desktop app may skip auth)
  owner?: string;                   // fxflow worker owner name

  // ── EDIT PARAMS ──
  mediaId: string;                  // ID ảnh gốc trên Google AI / provider
  projectId: string;                // Google AI project ID (tạm thời fake)
  editType: EditType;               // "crop" | "draw"

  // cropCoordinates dùng khi editType = "crop"
  cropCoordinates?: {
    top: number;
    left: number;
    right: number;
    bottom: number;
  };

  // drawPayload dùng khi editType = "draw" (custom blob cho tương lai)
  drawPayload?: any;

  // ── STATUS ──
  status: EditImageJobStatus;
  progress?: { percent: number; step?: string };
  error?: { message: string; raw?: any };

  // ── RESULT ──
  result?: {
    mediaId?: string;           // mediaId của ảnh đã edit
    resultUrl?: string;         // public URL (nếu có)
  };

  // ── ENGINE RAW ──
  engineResponse?: any;

  createdAt: Date;
  updatedAt: Date;
}

/* ================================
   SCHEMA
================================ */
const EditImageJobSchema = new Schema<IEditImageJob>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: false },
    owner:  { type: String, default: null, index: true },

    mediaId:   { type: String, required: true },
    projectId: { type: String, required: true },
    editType:  { type: String, enum: ["crop", "draw"], required: true },

    cropCoordinates: {
      top:    { type: Number },
      left:   { type: Number },
      right:  { type: Number },
      bottom: { type: Number },
    },

    drawPayload: { type: Schema.Types.Mixed },

    status: {
      type: String,
      enum: Object.values(EditImageJobStatus),
      default: EditImageJobStatus.PENDING,
      index: true,
    },

    progress: {
      percent: { type: Number, default: 0 },
      step:    { type: String },
    },

    error: {
      message: { type: String },
      raw:     { type: Schema.Types.Mixed },
    },

    result: {
      mediaId:   { type: String },
      resultUrl: { type: String },
    },

    engineResponse: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

EditImageJobSchema.index({ status: 1, createdAt: 1 });
EditImageJobSchema.index({ owner: 1, status: 1 });

export default mongoose.model<IEditImageJob>("EditImageJob", EditImageJobSchema);
