import { Schema, model, Types } from "mongoose";

export type DeployStatus = "SUCCESS" | "FAILED" | "RUNNING";

const DeployLogSchema = new Schema(
  {
    source: {
      type: String,
      enum: ["github", "gitlab", "manual"],
      default: "github",
      index: true,
    },
    repo: String,

    branch: { type: String, index: true },
    commitId: { type: String },
    commitMessage: { type: String },

    status: {
      type: String,
      enum: ["SUCCESS", "FAILED", "RUNNING"],
      index: true,
    },

    stdout: { type: String },
    stderr: { type: String },
    errorMessage: { type: String },

    durationMs: { type: Number },

    triggeredBy: {
      type: String, // github username / system
    },
  },
  { timestamps: true }
);

export const DeployLog = model("DeployLog", DeployLogSchema);
