import { Schema, model, Types } from "mongoose";

const SkyTokenTransactionSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", index: true },
    type: {
      type: String,
      enum: [
        "TOP_UP",
        "CONSUME",
        "EARN",
        "BONUS",
        "REFUND",
        "WELCOME",
        "WITHDRAW",
      ],
      required: true,
    },
    amount: Number,
    balanceAfter: Number,
    source: String, // bank_transfer, prompt_sale, prompt_purchase, admin, system
    note: String,
    meta: Schema.Types.Mixed,
  },
  { timestamps: true }
);

export default model("SkyTokenTransaction", SkyTokenTransactionSchema);
