import mongoose from "mongoose";

/**
 * GuideVideoModel:
 * Lưu danh sách video hướng dẫn / tutorial trong hệ thống NeoVideo
 */
const GuideVideoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    youtubeId: { type: String, required: true }, // eg: 'abc123XYZ'
    category: {
      type: String,
    },
    thumbUrl: { type: String, default: "" }, // ✅ Cho phép tự nhập hoặc generate tự động
    description: { type: String, default: "" },
    order: { type: Number, default: 0 }, // thứ tự hiển thị
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("GuideVideo", GuideVideoSchema);
