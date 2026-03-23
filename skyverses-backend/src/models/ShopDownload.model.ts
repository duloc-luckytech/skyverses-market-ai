import mongoose, { Schema, Document } from "mongoose";

export interface IShopDownload extends Document {
  userId: mongoose.Types.ObjectId;
  itemId: string;
  downloadUrl: string;
  licenseKey: string;
  createdAt: Date;
}

const ShopDownloadSchema = new Schema<IShopDownload>({
  userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
  itemId: { type: String, index: true },
  downloadUrl: String,
  licenseKey: String,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IShopDownload>(
  "ShopDownload",
  ShopDownloadSchema
);
