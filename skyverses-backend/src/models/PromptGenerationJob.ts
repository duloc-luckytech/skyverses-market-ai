import mongoose, { Schema } from "mongoose";

const PromptGenerationJobSchema = new mongoose.Schema(
  {
    groupId: String,
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    googleEmail: String,
    prompt: String,
    aspect: String,
    count: Number,
    seeds: [Number],
    lastTriedAt: Date,
    errorCount: Number,
    mode: {
      type: String,
      default: "GEM_PIX",
    },
    ownerIds: [mongoose.Types.ObjectId],
    referenceMediaId: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ["pending", "processing", "done", "fail", "error", "reject"],
      default: "pending",
    },
    type: {
      type: String,
      enum: ["image", "video"],
      default: "image",
      required: true,
    },
    errorMessage: String,
  },
  { timestamps: true }
);
export default mongoose.model("PromptGenerationJob", PromptGenerationJobSchema);
