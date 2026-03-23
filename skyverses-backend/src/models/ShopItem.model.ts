import mongoose, { Schema, Document } from "mongoose";

export type BillingType = "month" | "year" | "lifetime";
export type LevelType = "Beginner" | "Pro" | "Studio";

export interface IShopItem extends Document {
  code: string;              // starter-tools
  name: string;

  priceVND: number;
  billing: BillingType;

  shortDesc: string;
  fullDesc: string;

  target: string;
  level: LevelType;

  highlightPoints: string[];
  features: string[];
  steps: string[];

  videoUrl?: string;

  badge?: string;            // START HERE
  highlight?: boolean;       // highlight card

  active: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const ShopItemSchema = new Schema<IShopItem>(
  {
    code: {
      type: String,
      unique: true,
      index: true,
      required: true,
    },

    name: { type: String, required: true },

    priceVND: { type: Number, required: true },
    billing: {
      type: String,
      enum: ["month", "year", "lifetime"],
      default: "lifetime",
    },

    shortDesc: { type: String, default: "" },
    fullDesc: { type: String, default: "" },

    target: { type: String, default: "" },
    level: {
      type: String,
      enum: ["Beginner", "Pro", "Studio"],
      default: "Beginner",
    },

    highlightPoints: { type: [String], default: [] },
    features: { type: [String], default: [] },
    steps: { type: [String], default: [] },

    videoUrl: { type: String },

    badge: { type: String },
    highlight: { type: Boolean, default: false },

    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<IShopItem>("ShopItem", ShopItemSchema);