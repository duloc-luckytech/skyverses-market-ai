import { Schema, model, Types } from "mongoose";

const LocalizedStringSchema = {
  en: { type: String, default: "" },
  vi: { type: String, default: "" },
  ko: { type: String, default: "" },
  ja: { type: String, default: "" },
};

const PromptVariableSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: "" },
    defaultValue: { type: String, default: "" },
  },
  { _id: false }
);

const PromptItemSchema = new Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true }, // full prompt text
    description: { type: String, default: "" },
    variables: { type: [PromptVariableSchema], default: [] },
  },
  { _id: true }
);

const PromptSetSchema = new Schema(
  {
    sellerId: { type: Types.ObjectId, ref: "User", required: true, index: true },
    slug: { type: String, unique: true, required: true },
    title: LocalizedStringSchema,
    description: LocalizedStringSchema,
    category: {
      type: String,
      enum: ["coding", "writing", "marketing", "design", "business", "education", "other"],
      default: "other",
    },
    tags: { type: [String], default: [] },
    coverImage: { type: String, default: null },
    priceSKT: { type: Number, required: true, min: 0 },
    isFree: { type: Boolean, default: false },
    prompts: { type: [PromptItemSchema], default: [] },
    previewText: { type: String, default: "" }, // preview cho buyer xem trước
    status: {
      type: String,
      enum: ["draft", "pending", "active", "rejected", "archived"],
      default: "active",
    },
    isActive: { type: Boolean, default: true },
    featured: { type: Boolean, default: false },
    purchaseCount: { type: Number, default: 0 },
    totalEarned: { type: Number, default: 0 },
    sortOrder: { type: Number, default: 0 },
    promptCount: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 },
    wishlistCount: { type: Number, default: 0 },
    models: { type: [String], default: [] }, // e.g. ["gpt-4", "claude-3", "midjourney"]
    examples: {
      type: [
        {
          input: { type: String, default: "" },
          output: { type: String, default: "" },
          image: { type: String, default: null },
          video: { type: String, default: null },
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

PromptSetSchema.pre("save", function (next) {
  this.promptCount = this.prompts ? this.prompts.length : 0;
  next();
});

PromptSetSchema.index({ status: 1, isActive: 1, category: 1 });
PromptSetSchema.index({ tags: 1 });
PromptSetSchema.index({ purchaseCount: -1 });

export default model("PromptSet", PromptSetSchema);
