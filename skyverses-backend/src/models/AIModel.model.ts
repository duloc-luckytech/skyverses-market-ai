import { Schema, model } from "mongoose";

export type AIModelStatus = "active" | "inactive" | "draft";

const AIModelSchema = new Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true, // claude-3-5-sonnet
      index: true,
    },

    name: {
      type: String,
      required: true,
    },

    logoUrl: {
      type: String,
      required: true, // /logos/claude.svg or CDN
    },

    route: {
      type: String,
      required: true, // /models/claude-3-5-sonnet
    },

    description: {
      type: String,
    },

    provider: {
      type: String, // Anthropic, Midjourney, Meta, Runway...
    },

    category: {
      type: String, // text / image / video / multimodal
    },

    order: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["active", "inactive", "draft"],
      default: "active",
      index: true,
    },

    createdBy: {
      type: String, // admin email / userId
    },
  },
  { timestamps: true }
);

export default model("AIModel", AIModelSchema);