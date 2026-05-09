import { Schema, model, Types } from "mongoose";

const SellerFollowerSchema = new Schema(
  {
    sellerId: { type: Types.ObjectId, ref: "User", required: true, index: true },
    followerId: { type: Types.ObjectId, ref: "User", required: true, index: true },
  },
  { timestamps: true }
);

SellerFollowerSchema.index({ sellerId: 1, followerId: 1 }, { unique: true });

export default model("SellerFollower", SellerFollowerSchema);
