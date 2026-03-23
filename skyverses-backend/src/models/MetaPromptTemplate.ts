import mongoose, { Schema, Document } from "mongoose";

export interface IMetaPromptTemplate extends Document {
  name: string;
  role: string;
  rules: string[];
  outputFormat: string;

  // ⭐ NEW CONFIGURABLE FIELDS
  styles: string[];
  tones: string[];
  pacings: string[];
  modes: string[];

  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MetaPromptTemplateSchema = new Schema<IMetaPromptTemplate>(
  {
    name: { type: String, required: true },
    role: { type: String, required: true },

    rules: {
      type: [String],
      required: true,
    },

    outputFormat: { type: String, required: true },

    // ⭐ ARRAY STRING — ĐÚNG CÚ PHÁP
    styles: {
      type: [String],
      default: [], // hoặc bạn muốn bắt buộc → required: true
    },

    tones: {
      type: [String],
      default: [],
    },

    pacings: {
      type: [String],
      default: [],
    },

    isActive: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model<IMetaPromptTemplate>(
  "MetaPromptTemplate",
  MetaPromptTemplateSchema
);
