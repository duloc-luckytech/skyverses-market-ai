import mongoose, { Schema } from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    slug: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Project", projectSchema);
