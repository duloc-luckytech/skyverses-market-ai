import mongoose, { Schema, Document, Model } from "mongoose";

/* -----------------------------------------------------------
   🧩 TypeScript Interfaces
----------------------------------------------------------- */
export interface ITemplatePrompt {
  text: string;
  order?: number;
  meta?: Record<string, any>;
}

export interface ITemplateImage {
  name?: string;
  mediaId?: string;
  url?: string;
  role?: string;
}

export interface ITemplateJob extends Document {
  type: string;
  access: "free" | "pro";
  name: string;
  group?: string;
  prompts: ITemplatePrompt[];
  images: ITemplateImage[];
  outputUrl?: string;
  outputMeta?: Record<string, any>;
  tags?: string[];
  status: "pending" | "processing" | "done" | "failed";
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

/* -----------------------------------------------------------
   🧱 Model Type (Fix lỗi TypeScript)
----------------------------------------------------------- */
export interface TemplateJobModel extends Model<ITemplateJob> {}

/* -----------------------------------------------------------
   🧱 Schema MongoDB
----------------------------------------------------------- */
const TemplateJobSchema = new Schema<ITemplateJob>(
  {
    type: { type: String },

    access: { type: String, enum: ["free", "pro"], default: "free" },

    name: { type: String, required: true, trim: true },

    group: { type: String, trim: true },

    prompts: [
      {
        text: { type: String, required: true, trim: true },
        order: { type: Number, default: 0 },
        meta: { type: Schema.Types.Mixed, default: {} },
      },
    ],

    images: [
      {
        name: { type: String, trim: true },
        mediaId: { type: String, trim: true },
        url: { type: String, trim: true },
        role: { type: String, trim: true },
      },
    ],

    outputUrl: { type: String, trim: true },
    outputMeta: { type: Schema.Types.Mixed },

    tags: [{ type: String, trim: true }],

    status: {
      type: String,
      enum: ["pending", "processing", "done", "failed"],
      default: "done",
    },

    errorMessage: { type: String, trim: true },
  },
  { timestamps: true }
);

/* -----------------------------------------------------------
   🚀 Export Model (FIX TS by adding Model typing)
----------------------------------------------------------- */
const TemplateJob =
  (mongoose.models.TemplateJob as TemplateJobModel) ||
  mongoose.model<ITemplateJob, TemplateJobModel>(
    "TemplateJob",
    TemplateJobSchema
  );

export default TemplateJob;