import { Schema, model, Types } from "mongoose";

const CreditTransactionSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", index: true },
    type: {
      type: String,
      enum: ["DAILY","TOP_UP", "CONSUME", "BONUS", "REFUND", "WELCOME", "EVENT_BONUS", "FREE_IMAGE"],
      required: true,
    },
    amount: Number,
    balanceAfter: Number,
    source: String, // stripe, momo, admin, system
    note: String,
    meta: Schema.Types.Mixed,
  },
  { timestamps: true }
);

export default model("CreditTransaction", CreditTransactionSchema);