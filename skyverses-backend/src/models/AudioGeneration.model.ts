import mongoose, { Document, Model, Schema } from "mongoose";

export type AudioGenerationKind = "tts" | "dialogue" | "podcast";
export type AudioGenerationStatus = "pending" | "completed" | "failed";

export interface IAudioGeneration extends Omit<Document, "model"> {
  userId: mongoose.Types.ObjectId;
  kind: AudioGenerationKind;
  taskName?: string;
  textPreview?: string;
  inputText?: string;
  outputUrl?: string;
  transcriptUrl?: string;
  provider: string;
  voiceId?: string;
  voiceName?: string;
  language?: string;
  model?: string;
  charCount: number;
  creditsUsed: number;
  creditsRefunded: number;
  status: AudioGenerationStatus;
  errorMessage?: string;
  durationMs?: number;
  meta?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const AudioGenerationSchema = new Schema<IAudioGeneration>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    kind: {
      type: String,
      enum: ["tts", "dialogue", "podcast"],
      required: true,
      index: true,
    },
    taskName: String,
    textPreview: String,
    inputText: String,
    outputUrl: String,
    transcriptUrl: String,
    provider: { type: String, required: true },
    voiceId: String,
    voiceName: String,
    language: String,
    model: String,
    charCount: { type: Number, default: 0 },
    creditsUsed: { type: Number, default: 0 },
    creditsRefunded: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
      index: true,
    },
    errorMessage: String,
    durationMs: Number,
    meta: Schema.Types.Mixed,
  },
  { timestamps: true }
);

AudioGenerationSchema.index({ userId: 1, kind: 1, createdAt: -1 });

const AudioGeneration: Model<IAudioGeneration> =
  mongoose.models.AudioGeneration ||
  mongoose.model<IAudioGeneration>("AudioGeneration", AudioGenerationSchema);

export default AudioGeneration;
