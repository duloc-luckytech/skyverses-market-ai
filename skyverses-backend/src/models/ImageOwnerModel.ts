import mongoose from "mongoose";

/**
 * ImageOwnerSchema:
 * Lưu thông tin người sở hữu ảnh đã upload lên Google AI
 *
 * - userId: người dùng thật (người upload hình)
 * - googleEmail: email của tài khoản Google dùng để gọi API upload
 * - mediaId: ID ảnh trả về từ Google
 * - width / height: kích thước ảnh trả về
 */
const ImageOwnerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    groupId: { type: String, default: null },
    googleEmail: { type: String }, // email dùng để gọi Google API
    mediaId: { type: String },
    projectId: { type: String, default: null }, // ✅ Google project ID returned by FXFlow worker
    type: { type: String },
    source: { type: String },
    prompt: { type: String },
    mediaIdEdit: { type: String },
    referenceMediaId: {
      type: [String],
      default: [],
    },
    width: { type: Number },
    retryCount: { type: Number },
    imageUrl: { type: String }, // ✅ thêm dòng này
    videoJobId: { type: String }, // ✅ For tracking external video tasks
    videoJobField: { type: String }, // e.g. "startImage" or "images.0"
    pendingVideoPayload: { type: mongoose.Schema.Types.Mixed, default: null }, // ✅ Lưu config video task chờ mediaId
    height: { type: Number },
    originalName: { type: String, default: null },
    status: {
      type: String,
      enum: [
        "pending",
        "ready",
        "processing",
        "done",
        "fail",
        "reject",
        "processing-upload",
        "pending-fxflow-upload",
      ],
      default: "processing",
    },
    errorCode: { type: String }, // lưu lỗi nếu có
    errorMessage: { type: String }, // lưu lỗi nếu có
  },
  { timestamps: true }
);

export default mongoose.model("ImageOwner", ImageOwnerSchema);
