import mongoose, { Schema, Document } from "mongoose";

/* =========================
   INTERFACE
========================= */
export interface IMarketItem extends Document {
  id: string;
  slug: string;

  name: {
    en: string;
    vi?: string;
    ko?: string;
    ja?: string;
  };

  category: {
    en: string;
    vi?: string;
    ko?: string;
    ja?: string;
  };

  description: {
    en: string;
    vi?: string;
    ko?: string;
    ja?: string;
  };

  problems: string[];
  industries: string[];

  imageUrl: string;
  demoType: string;
  homeBlocks: {
    type: [String];
    default: [];
    index: true;
  };

  tags: string[];
  models: string[];
  features: {
    en: string;
    vi?: string;
    ko?: string;
    ja?: string;
  }[];

  complexity: string;

  priceReference?: string;

  neuralStack: {
    name: string;
    version?: string;
    capability: {
      en: string;
      vi?: string;
      ko?: string;
      ja?: string;
    };
  }[];
  isActive: boolean;
  status: string;
  featured: boolean;
  order: number;
  isFree: boolean;
  priceCredits: number;
  createdAt: Date;
  updatedAt: Date;
}

/* =========================
   SCHEMA
========================= */
const MarketItemSchema = new Schema<IMarketItem>(
  {
    id: { type: String, unique: true, index: true },
    slug: { type: String, unique: true, index: true },

    name: Object,
    category: Object,
    description: Object,

    problems: [String],
    models: [String],
    industries: [String],

    imageUrl: { type: String, required: true },
    demoType: String,

    tags: [String],

    features: [Object],

    complexity: String,
    priceReference: String,

    neuralStack: [
      {
        name: { type: String, required: true },
        version: String,
        capability: Object,
      },
    ],

    homeBlocks: {
      type: [String],
      default: [],
      index: true,
    },

    status: String,
    isFree: Boolean,
    priceCredits: Number,
    isActive: { type: Boolean, default: true },
    featured: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model<IMarketItem>("MarketItem", MarketItemSchema);
