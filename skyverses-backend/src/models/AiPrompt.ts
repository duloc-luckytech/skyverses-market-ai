import mongoose, { Schema, Document } from "mongoose";

export interface IAiPrompt extends Document {
  type: "image" | "video";
  title: string;
  prompt: string;
  platform?: string;
  tags: string[];
  examples: string[];
  sourceCSV?: string;
  raw: any;
  exampleStatus: string;
  likes: number;
  views: number;
  localExamples: string[];
  // ⭐ NEW
  shareAccess: "none" | "plan1" | "plan2" | "trial" | "all";
}

const AiPromptSchema = new Schema<IAiPrompt>(
  {
    type: { type: String, enum: ["image", "video"], required: true },
    title: { type: String, required: true },
    prompt: { type: String, required: true },
    platform: { type: String },
    exampleStatus: { type: String },
    tags: [{ type: String }],
    examples: [{ type: String }],
    localExamples: [String], // link lưu tạm (sẽ được job cập nhật)

    sourceCSV: { type: String },
    raw: { type: Object },

    likes: { type: Number, default: 0 },
    views: { type: Number, default: 0 },

    // ⭐ NEW FIELD
    shareAccess: {
      type: String,
      enum: ["none", "plan1", "plan2", "trial", "all"],
      default: "none",
    },
  },
  { timestamps: true }
);

export default mongoose.model<IAiPrompt>("AiPromptTemplate", AiPromptSchema);
