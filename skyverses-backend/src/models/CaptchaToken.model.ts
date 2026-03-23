// models/CaptchaToken.model.ts
import mongoose, { Schema, Document } from "mongoose";

export interface ICaptchaToken extends Document {
  tokenCaptcha: string;
  jobId?: mongoose.Types.ObjectId; 

  // trạng thái captcha
  status: "pending" | "locked" | "used" | "expired";

  // job đang giữ captcha
  lockedByJob?: mongoose.Types.ObjectId;

  // thời điểm lock / dùng
  lockedAt?: Date;
  usedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const CaptchaTokenSchema = new Schema<ICaptchaToken>(
  {
    tokenCaptcha: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["pending", "locked", "used", "expired"],
      default: "pending",
      index: true,
    },
    jobId: { type: Schema.Types.ObjectId, ref: "VideoJob" },


    // ⭐ job nào đang giữ captcha
    lockedByJob: {
      type: Schema.Types.ObjectId,
      ref: "VideoJob",
      index: true,
    },

    lockedAt: { type: Date, index: true },
    usedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

/* -------------------------------------------------------
   🔥 INDEX PHỤC VỤ ATOMIC PICK CAPTCHA
--------------------------------------------------------- */

// Lấy captcha mới nhất + chưa expire + chưa lock
CaptchaTokenSchema.index({
  status: 1,
  createdAt: -1,
});

// Unlock captcha bị treo
CaptchaTokenSchema.index({
  status: 1,
  lockedAt: 1,
});

/* -------------------------------------------------------
   ⏱️ TTL CLEANUP
   → Mongo sẽ tự xóa document sau 10 phút
--------------------------------------------------------- */
CaptchaTokenSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 600 } // 10 phút
);

export default mongoose.model<ICaptchaToken>(
  "CaptchaToken",
  CaptchaTokenSchema
);