import mongoose, { Schema, Document } from "mongoose";

/**
 * PRICING MATRIX (OBJECT DEEP)
 * engine.model.version.resolution.seconds = credits
 */
export interface IModelPricingMatrix extends Document {
  tool: "video" | "image";
  name: string;
  mode: string;
  modes: string[]; // ["relaxed", "fast"]
  engine: string; // fxlab | wan | gommo | google_veo
  modelKey: string; // veo3 | wan-t2v | gommo-anim
  version: string; // 1.0 | 2.0 | 3.0

  status: "active" | "deprecated" | "disabled";
  description?: string;
  /**
   * basePricing = giá gốc (cost price từ provider)
   * pricing = basePricing × priceMultiplier (giá bán cho user)
   */
  basePricing: {
    [resolution: string]: {
      [seconds: string]: number;
    };
  };
  priceMultiplier: number; // default 5x
  pricing: {
    [resolution: string]: {
      [seconds: string]: number;
    };
  };
  aspectRatios: string[];

  createdAt: Date;
  updatedAt: Date;
}

const ModelPricingMatrixSchema = new Schema<IModelPricingMatrix>(
  {
    tool: { type: String, required: true, index: true },
    name: { type: String },
    engine: { type: String, required: true, index: true },
    modelKey: { type: String, required: true, index: true },
    version: { type: String, required: true },
    description: { type: String },
    mode: { type: String },
    aspectRatios: {
      type: [String],
      default: [],
    }, // ["1:1", "16:9", "9:16"]
    modes: {
      type: [String],
      default: [],
      index: true,
    },
    status: {
      type: String,
      enum: ["active", "deprecated", "disabled"],
      default: "active",
    },

    basePricing: {
      type: Schema.Types.Mixed, // giá gốc từ provider
      default: {},
    },
    priceMultiplier: {
      type: Number,
      default: 5, // x5 giá gốc
    },
    pricing: {
      type: Schema.Types.Mixed, // ⭐ OBJECT DEEP = basePricing × multiplier
      required: true,
    },
  },
  { timestamps: true }
);

ModelPricingMatrixSchema.index({
  tool: 1,
  engine: 1,
  modelKey: 1,
  version: -1,
});

export default mongoose.model<IModelPricingMatrix>(
  "ModelPricingMatrix",
  ModelPricingMatrixSchema
);
