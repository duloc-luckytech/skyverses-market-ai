import mongoose, { Schema, Document } from "mongoose";

export interface ICoupon extends Document {
  code: string;
  title: string;
  videoAmount: number;
  expireAt: Date;
  isUsed: boolean;
  usedBy?: mongoose.Types.ObjectId;
  usedAt?: Date;
}

const CouponSchema = new Schema<ICoupon>(
  {
    code: { type: String, unique: true, required: true },
    title: { type: String, required: true },
    videoAmount: { type: Number, required: true },
    expireAt: { type: Date, required: true },

    isUsed: { type: Boolean, default: false },
    usedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    usedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model<ICoupon>("Coupon", CouponSchema);