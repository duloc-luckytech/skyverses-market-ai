import mongoose, { Document, Model, Schema } from "mongoose";

export type AudioVoiceProvider = "gemini" | "gommo";
export type AudioVoiceGender = "male" | "female" | "neutral";

export interface IAudioVoice extends Document {
  ownerId?: mongoose.Types.ObjectId | null;
  provider: AudioVoiceProvider;
  providerVoiceId: string;
  name: string;
  description?: string;
  gender: AudioVoiceGender;
  language: string;
  shared: boolean;
  status: "ready" | "pending" | "failed";
  previewUrl?: string;
  sampleUrl?: string;
  tags: string[];
  isCloned: boolean;
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AudioVoiceSchema = new Schema<IAudioVoice>(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: "User", default: null, index: true },
    provider: { type: String, enum: ["gemini", "gommo"], required: true, index: true },
    providerVoiceId: { type: String, required: true },
    name: { type: String, required: true },
    description: String,
    gender: {
      type: String,
      enum: ["male", "female", "neutral"],
      default: "neutral",
    },
    language: { type: String, default: "en", index: true },
    shared: { type: Boolean, default: true },
    status: {
      type: String,
      enum: ["ready", "pending", "failed"],
      default: "ready",
    },
    previewUrl: String,
    sampleUrl: String,
    tags: [{ type: String }],
    isCloned: { type: Boolean, default: false },
    isFavorite: { type: Boolean, default: false },
  },
  { timestamps: true }
);

AudioVoiceSchema.index(
  { provider: 1, providerVoiceId: 1, ownerId: 1 },
  { unique: true }
);

const AudioVoice: Model<IAudioVoice> =
  mongoose.models.AudioVoice || mongoose.model<IAudioVoice>("AudioVoice", AudioVoiceSchema);

export default AudioVoice;
