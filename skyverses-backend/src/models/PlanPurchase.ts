// models/PlanPurchase.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IPlanPurchase extends Document {
  userId: mongoose.Types.ObjectId;
  plan: string;
  amount: number;

  isFirstMonth: boolean;
  monthIndex: number;

  affiliateRate: number;
  affiliateAmount: number;

  paidTo: mongoose.Types.ObjectId;
  createdAt: Date;
}

const PlanPurchaseSchema = new Schema<IPlanPurchase>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },

    plan: { type: String, required: true },
    amount: { type: Number, required: true },

    isFirstMonth: { type: Boolean, default: false },
    monthIndex: { type: Number, default: 1 },

    affiliateRate: { type: Number, default: 0 },
    affiliateAmount: { type: Number, default: 0 },

    paidTo: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model<IPlanPurchase>("PlanPurchase", PlanPurchaseSchema);