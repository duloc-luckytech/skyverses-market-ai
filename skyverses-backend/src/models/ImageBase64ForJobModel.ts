import mongoose from "mongoose";

/**
 * ImageBase64Schema:
 * Lưu riêng phần base64 để tránh lock khi query ImageOwner
 * - imageId: chính là _id từ ImageOwner
 * - base64: chuỗi base64 của hình ảnh
 */
const ImageBase64ForJobModelSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "VideoId",
      required: true,
      unique: true,
    },
    type: { type: String },
    base64: { type: String },
    endBase64: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model(
  "ImageBase64ForJobModel",
  ImageBase64ForJobModelSchema
);
