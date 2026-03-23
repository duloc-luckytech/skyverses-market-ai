import mongoose, {
    Schema,
    Document,
    Model,
    Types,
  } from "mongoose";
  
  /* ======================================================
     INTERFACE
  ====================================================== */
  
  export interface IRunningHubTemplate extends Document {
    _id: Types.ObjectId;
  
    /** ID gốc từ RunningHub */
    templateId: string;
  
    name: string;
    desc: string;
    systemWorkflow: boolean;
  
    publishTime: Date | null;
    timestamp: number | null;
  
    owner: {
      id: string;
      name: string;
      avatar: string | null;
    };
  
    statistics: {
      likeCount: number;
      downloadCount: number;
      useCount: number;
      pv: number;
      collectCount: number;
    };
  
    covers: {
      id: string;
      url: string;
      thumbnailUri: string;
      imageWidth: number;
      imageHeight: number;
    }[];
  
    tags: {
      id: string;
      name: string;
      nameEn: string;
    }[];
  
    labels: string | null;
    seq: number | null;
  
    /** Raw response để debug / extend */
    raw: any;
  
    fetchedAt: Date;
    createdAt: Date;
    updatedAt: Date;
  }
  
  /* ======================================================
     SCHEMA
  ====================================================== */
  
  const RunningHubTemplateSchema = new Schema<IRunningHubTemplate>(
    {
      templateId: {
        type: String,
        required: true,
        unique: true,
        index: true,
      },
  
      name: { type: String, required: true },
      desc: { type: String },
  
      systemWorkflow: { type: Boolean, default: false },
  
      publishTime: { type: Date, default: null },
      timestamp: { type: Number, default: null },
  
      owner: {
        id: { type: String },
        name: { type: String },
        avatar: { type: String, default: null },
      },
  
      statistics: {
        likeCount: { type: Number, default: 0 },
        downloadCount: { type: Number, default: 0 },
        useCount: { type: Number, default: 0 },
        pv: { type: Number, default: 0 },
        collectCount: { type: Number, default: 0 },
      },
  
      covers: [
        {
          id: { type: String },
          url: { type: String },
          thumbnailUri: { type: String },
          imageWidth: { type: Number },
          imageHeight: { type: Number },
        },
      ],
  
      tags: [
        {
          id: { type: String },
          name: { type: String },
          nameEn: { type: String },
        },
      ],
  
      labels: { type: String, default: null },
      seq: { type: Number, default: null },
  
      raw: { type: Schema.Types.Mixed },
  
      fetchedAt: { type: Date, default: Date.now },
    },
    {
      timestamps: true,
      minimize: false,
    }
  );
  
  /* ======================================================
     INDEXES (OPTIONAL BUT GOOD)
  ====================================================== */
  
  RunningHubTemplateSchema.index({ "statistics.useCount": -1 });
  RunningHubTemplateSchema.index({ fetchedAt: -1 });
  
  /* ======================================================
     MODEL EXPORT (⚠️ IMPORTANT FIX)
  ====================================================== */
  
  /**
   * ⚠️ CỰC KỲ QUAN TRỌNG:
   * Ép kiểu Model<IRunningHubTemplate>
   * để tránh lỗi:
   * "This expression is not callable" (TS + Mongoose overload)
   */
  export const RunningHubTemplate: Model<IRunningHubTemplate> =
    (mongoose.models.RunningHubTemplate as Model<IRunningHubTemplate>) ||
    mongoose.model<IRunningHubTemplate>(
      "RunningHubTemplate",
      RunningHubTemplateSchema
    );
  
  /* ======================================================
     DEFAULT EXPORT (OPTIONAL)
  ====================================================== */
  
  export default RunningHubTemplate;