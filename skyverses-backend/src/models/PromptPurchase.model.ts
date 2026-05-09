import { Schema, model, Types } from "mongoose";

const PromptPurchaseSchema = new Schema(
  {
    buyerId: { type: Types.ObjectId, ref: "User", required: true, index: true },
    sellerId: { type: Types.ObjectId, ref: "User", required: true, index: true },
    promptSetId: { type: Types.ObjectId, ref: "PromptSet", required: true, index: true },
    pricePaid: { type: Number, required: true }, // SKT buyer trả
    sellerReceived: { type: Number, required: true }, // SKT seller nhận (sau trừ phí)
    platformFee: { type: Number, required: true }, // SKT platform giữ
    feePercent: { type: Number, default: 10 }, // % phí
  },
  { timestamps: true }
);

// Compound index: 1 buyer chỉ mua 1 prompt set 1 lần
PromptPurchaseSchema.index({ buyerId: 1, promptSetId: 1 }, { unique: true });

export default model("PromptPurchase", PromptPurchaseSchema);
