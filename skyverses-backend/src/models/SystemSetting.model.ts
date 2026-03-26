import mongoose from "mongoose";

const SystemSettingSchema = new mongoose.Schema(
  {
    key: { type: String, unique: true, required: true },
    value: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

const SystemSetting =
  (mongoose.models.SystemSetting ||
    mongoose.model("SystemSetting", SystemSettingSchema)) as mongoose.Model<any>;

export default SystemSetting;
