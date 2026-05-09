import { Schema, model, Types } from "mongoose";

const PromptWishlistSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", required: true, index: true },
    promptSetId: { type: Types.ObjectId, ref: "PromptSet", required: true, index: true },
  },
  { timestamps: true }
);

PromptWishlistSchema.index({ userId: 1, promptSetId: 1 }, { unique: true });

export default model("PromptWishlist", PromptWishlistSchema);
