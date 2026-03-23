// models/AffiliateTransaction.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IAffiliateTransaction extends Document {
  affiliateId: mongoose.Types.ObjectId;
  fromUserId: mongoose.Types.ObjectId;

  amount: number;
  rate: number;

  type: "first_month" | "renew";
  plan: string;

  createdAt: Date;
}

const AffiliateTransactionSchema = new Schema<IAffiliateTransaction>(
  {
    affiliateId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    fromUserId: { type: Schema.Types.ObjectId, ref: "User", required: true },

    amount: Number,
    rate: Number,

    type: { type: String, enum: ["first_month", "renew"], required: true },
    plan: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IAffiliateTransaction>(
  "AffiliateTransaction",
  AffiliateTransactionSchema
);