/* ======================================================
   📌 MODEL PAYMENT (tạo file nếu chưa có)
====================================================== */
import mongoose, { Schema, Document } from "mongoose";

export interface IAffiliatePayment extends Document {
  affiliateId: mongoose.Types.ObjectId;
  amount: number;
  note?: string;
  createdBy: string;
  createdAt: Date;
}

const AffiliatePaymentSchema = new Schema<IAffiliatePayment>(
  {
    affiliateId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    note: { type: String, default: "" },
    createdBy: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model<IAffiliatePayment>(
  "AffiliatePayment",
  AffiliatePaymentSchema
);