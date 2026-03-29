import mongoose, { Schema, Document } from "mongoose";

/* =========================
   INTERFACE
========================= */
export interface IProductSubmission extends Document {
  // Product Info
  productName: string;
  productSlug: string;
  category: string;
  complexity: string;
  shortDescription: string;
  fullDescription: string;
  demoType: string;
  tags: string[];

  // Media & Pricing
  thumbnailUrl: string;
  galleryUrls: string[];
  demoUrl: string;
  priceCredits: number;
  isFree: boolean;
  platforms: string[];

  // Technical
  aiModels: string[];
  features: string[];
  apiEndpoint: string;
  documentation: string;

  // Creator Info
  creatorId: string;       // ref to User._id
  creatorName: string;
  creatorEmail: string;
  creatorStudio: string;
  creatorWebsite: string;
  creatorTelegram: string;
  additionalNotes: string;

  // Review Process
  status: "pending" | "reviewing" | "approved" | "rejected" | "published";
  adminFeedback: string;
  reviewedBy: string;      // admin name
  reviewedAt: Date;

  createdAt: Date;
  updatedAt: Date;
}

/* =========================
   SCHEMA
========================= */
const ProductSubmissionSchema = new Schema<IProductSubmission>(
  {
    // Product Info
    productName: { type: String, required: true },
    productSlug: { type: String, required: true, index: true },
    category: { type: String, required: true },
    complexity: { type: String, default: "Standard" },
    shortDescription: { type: String, required: true },
    fullDescription: { type: String, default: "" },
    demoType: { type: String, default: "text" },
    tags: { type: [String], default: [] },

    // Media & Pricing
    thumbnailUrl: { type: String, default: "" },
    galleryUrls: { type: [String], default: [] },
    demoUrl: { type: String, default: "" },
    priceCredits: { type: Number, default: 0 },
    isFree: { type: Boolean, default: false },
    platforms: { type: [String], default: ["web"] },

    // Technical
    aiModels: { type: [String], default: [] },
    features: { type: [String], default: [] },
    apiEndpoint: { type: String, default: "" },
    documentation: { type: String, default: "" },

    // Creator Info
    creatorId: { type: String, index: true },
    creatorName: { type: String, required: true },
    creatorEmail: { type: String, required: true },
    creatorStudio: { type: String, default: "" },
    creatorWebsite: { type: String, default: "" },
    creatorTelegram: { type: String, default: "" },
    additionalNotes: { type: String, default: "" },

    // Review Process
    status: {
      type: String,
      enum: ["pending", "reviewing", "approved", "rejected", "published"],
      default: "pending",
      index: true,
    },
    adminFeedback: { type: String, default: "" },
    reviewedBy: { type: String, default: "" },
    reviewedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model<IProductSubmission>(
  "ProductSubmission",
  ProductSubmissionSchema
);
