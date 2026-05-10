import { Schema, model, Types } from "mongoose";

const SkyTokenWithdrawalSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", required: true, index: true },
    amountSKT: { type: Number, required: true, min: 1 },
    amountVND: { type: Number, required: true, min: 0 },
    bankName: { type: String, required: true },
    bankAccountNumber: { type: String, required: true },
    bankAccountName: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "completed"],
      default: "pending",
      index: true,
    },
    adminNote: { type: String, default: "" },
    processedBy: { type: Types.ObjectId, ref: "User", default: null },
    processedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default model("SkyTokenWithdrawal", SkyTokenWithdrawalSchema);
