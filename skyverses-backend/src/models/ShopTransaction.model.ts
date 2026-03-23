import mongoose, { Schema, Document } from "mongoose";

export interface IShopTransaction extends Document {
  userId: mongoose.Types.ObjectId;
  itemId: string;
  amount: number;
  note: string;
  status: "pending" | "paid";
  paidAt?: Date;
  createdAt: Date;
}

const ShopTransactionSchema = new Schema<IShopTransaction>({
  userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
  itemId: { type: String, index: true },
  amount: Number,
  note: String,
  status: { type: String, enum: ["pending", "paid"], default: "pending" },
  paidAt: Date,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IShopTransaction>(
  "ShopTransaction",
  ShopTransactionSchema
);