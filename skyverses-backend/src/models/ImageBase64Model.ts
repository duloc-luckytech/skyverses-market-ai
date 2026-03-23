import mongoose from "mongoose";

/**
 * ImageBase64Schema:
 * Lưu riêng phần base64 để tránh lock khi query ImageOwner
 * - imageId: chính là _id từ ImageOwner
 * - base64: chuỗi base64 của hình ảnh
 */
const ImageBase64Schema = new mongoose.Schema(
  {
    imageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ImageOwner",
      required: true,
      unique: true,
    },
    base64: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("ImageBase64", ImageBase64Schema);
