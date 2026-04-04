import mongoose, { Schema, Document } from "mongoose";

/**
 * FXFLOW OWNER — Quản lý danh sách owner (tài khoản bên thứ 3) pull task
 * 
 * - Mỗi owner có name (unique), status (active/inactive)
 * - Khi tạo job, BE random 1 owner đang active để gán vào job
 * - Bên thứ 3 gọi GET /fxflow/tasks/pending?owner=acc1 để lấy task riêng
 */
export interface IFxflowOwner extends Document {
  name: string;         // "acc1", "acc2", "acc3"
  status: "active" | "inactive";
  description?: string; // ghi chú
  provider?: string;    // "fxflow" | "grok" | null (legacy/shared)
  createdAt: Date;
  updatedAt: Date;
}

const FxflowOwnerSchema = new Schema<IFxflowOwner>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    description: {
      type: String,
      default: "",
    },
    provider: {
      type: String,
      default: null,
      index: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IFxflowOwner>("FxflowOwner", FxflowOwnerSchema);
