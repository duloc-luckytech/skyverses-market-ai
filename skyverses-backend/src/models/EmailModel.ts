// models/EmailModel.ts
import mongoose, { Schema, Document } from "mongoose";

/* ============================================================
   📌 INTERFACE — EMAIL TEMPLATE
============================================================ */
export interface IEmailTemplate extends Document {
  name: string;                // "welcome", "plan_activated", ...
  title?: string;
  subject: string;
  html: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/* ============================================================
   📌 INTERFACE — EMAIL LOG
============================================================ */
export interface IEmailLog extends Document {
  userId?: mongoose.Types.ObjectId;
  to: string;

  templateName?: string;
  subject: string;
  html: string;

  status: "success" | "failed";
  error?: string;

  type?: string;                     // "welcome", "plan", "reminder", ...
  meta?: Record<string, any>;

  createdAt: Date;
}

/* ============================================================
   📌 SCHEMA — EMAIL TEMPLATE
============================================================ */
const EmailTemplateSchema = new Schema<IEmailTemplate>(
  {
    name: { type: String, required: true, unique: true },
    title: { type: String },
    subject: { type: String, required: true },
    html: { type: String, required: true },
    description: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

/* ============================================================
   📌 SCHEMA — EMAIL LOG
============================================================ */
const EmailLogSchema = new Schema<IEmailLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },

    to: { type: String, required: true },

    templateName: { type: String },
    subject: { type: String, required: true },
    html: { type: String, required: true },

    status: {
      type: String,
      enum: ["success", "failed"],
      required: true,
    },

    error: { type: String },
    type: { type: String },

    meta: { type: Schema.Types.Mixed, default: {} },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

/* ============================================================
   📌 EXPORT MODEL
============================================================ */
export const EmailTemplateModel = mongoose.model<IEmailTemplate>(
  "EmailTemplate",
  EmailTemplateSchema
);

export const EmailLogModel = mongoose.model<IEmailLog>(
  "EmailLog",
  EmailLogSchema
);