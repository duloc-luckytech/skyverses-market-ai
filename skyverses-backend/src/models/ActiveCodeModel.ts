import mongoose from "mongoose";

const ActiveCodeSchema = new mongoose.Schema(
  {
    code: { type: String, unique: true, required: true },
    plan: { type: String, required: true },
    days: { type: Number, default: 1 },
    isUsed: { type: Boolean, default: false },
    usedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    usedAt: { type: Date },
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: "ActiveCodeGroup" }, // 🆕 Liên kết nhóm
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const ActiveCodeGroupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // Tên nhóm (ví dụ: "Chiến dịch Tết 2025")
    description: { type: String, default: "" },
  },
  { timestamps: true }
);

const ActiveCodeGroup = mongoose.model(
  "ActiveCodeGroup",
  ActiveCodeGroupSchema
);

const ActiveCode = mongoose.model("ActiveCode", ActiveCodeSchema);
export { ActiveCodeGroup, ActiveCode };
