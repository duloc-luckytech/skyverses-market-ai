import { Schema, model, Types } from "mongoose";

const PromptReviewSchema = new Schema(
  {
    buyerId: { type: Types.ObjectId, ref: "User", required: true, index: true },
    promptSetId: { type: Types.ObjectId, ref: "PromptSet", required: true, index: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: "" },
  },
  { timestamps: true }
);

// One review per buyer per prompt set
PromptReviewSchema.index({ buyerId: 1, promptSetId: 1 }, { unique: true });

export default model("PromptReview", PromptReviewSchema);
