import mongoose from "mongoose";

const VideoConcatJobSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    googleEmail: {
      type: String, // email trong GoogleToken
      required: true,
    },
    projectId: String,
    mediaIds: [String],
    operationName: String,
    encodedVideo: String,
    status: {
      type: String,
      enum: ["pending", "processing", "done", "failed"],
      default: "pending",
    },
    segments: [
      {
        mediaId: String,
        start: Number, // giây
        end: Number,
      },
    ],
    filePath: String,
    error: String,
  },
  { timestamps: true }
);

export default mongoose.model("VideoConcatJob", VideoConcatJobSchema);
