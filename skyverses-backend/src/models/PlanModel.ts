import mongoose, { Schema } from "mongoose";

const FeatureSchema = new Schema(
  {
    maxPrompt: { type: Number, default: 0 },          // số prompt tối đa
    maxVideosPerRequest: { type: Number, default: 1 }, // số video tạo ra / 1 lần gửi
  },
  { _id: false }
);

const PlanSchema = new Schema(
  {
    key: { type: String, required: true, unique: true }, // free, starter, pro...
    title: { type: String, required: true },
    code: { type: String, required: true },

    price: { type: String, required: true },
    discountPrice: { type: String, default: null }, 

    badge: { type: String },
    perks: { type: [String], default: [] },

    // ==========================
    // 🔥 CẤU HÌNH CHUNG
    // ==========================
    maxDuration: { type: Number, default: 8 },   // tối đa X giây
    maxVideo: { type: Number, default: 0 },      // tổng số video có thể tạo

    maxVideoType: {
      type: String,
      enum: ["fixed", "per_day", "per_month", "unlimited"],
      default: "per_month",
    },


    maxPrompt: { type: Number, default: 0 },     // tổng số prompt (nếu có)
    videoPerMinute: { type: Number, default: 1 },
    expire: { type: Number, default: 3 },        // ngày hết hạn
    storageHoursVideo: { type: Number, default: 3 },   // lưu video trong bao lâu
    storageHoursImage: { type: Number, default: 3 },   // lưu ảnh trong bao lâu

    // ==========================
    // 🔥 CẤU HÌNH CHO TỪNG LOẠI VIDEO
    // ==========================
    textToVideo: { type: FeatureSchema, default: () => ({}) },
    imageToVideo: { type: FeatureSchema, default: () => ({}) },
    startEndFrame: { type: FeatureSchema, default: () => ({}) },
    characterSync: { type: FeatureSchema, default: () => ({}) },
  },
  { timestamps: true }
);

export default mongoose.model("Plan", PlanSchema);