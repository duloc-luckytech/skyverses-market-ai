import mongoose, { Schema, Document } from "mongoose";

/* =========================
   INTERFACE
========================= */
export interface IBlogPost extends Document {
  slug: string;

  title: {
    en: string;
    vi?: string;
    ko?: string;
    ja?: string;
  };

  excerpt: {
    en: string;
    vi?: string;
    ko?: string;
    ja?: string;
  };

  content: {
    en: string;
    vi?: string;
    ko?: string;
    ja?: string;
  };

  coverImage: string;
  category: string;
  tags: string[];

  author: {
    name: string;
    avatar: string;
    role: string;
  };

  seo: {
    metaTitle: {
      en: string;
      vi?: string;
      ko?: string;
      ja?: string;
    };
    metaDescription: {
      en: string;
      vi?: string;
      ko?: string;
      ja?: string;
    };
    ogImage: string;
    keywords: string[];
  };

  isPublished: boolean;
  isFeatured: boolean;
  publishedAt: Date;
  readTime: number;
  viewCount: number;
  order: number;
  relatedSlugs: string[];

  createdAt: Date;
  updatedAt: Date;
}

/* =========================
   SCHEMA
========================= */
const BlogPostSchema = new Schema<IBlogPost>(
  {
    slug: { type: String, unique: true, required: true, index: true },

    title: {
      en: { type: String, required: true },
      vi: String,
      ko: String,
      ja: String,
    },

    excerpt: {
      en: { type: String, required: true },
      vi: String,
      ko: String,
      ja: String,
    },

    content: {
      en: { type: String, required: true },
      vi: String,
      ko: String,
      ja: String,
    },

    coverImage: { type: String, required: true },
    category: { type: String, required: true, index: true },
    tags: [String],

    author: {
      name: { type: String, default: "Skyverses Team" },
      avatar: { type: String, default: "" },
      role: { type: String, default: "Editor" },
    },

    seo: {
      metaTitle: {
        en: String,
        vi: String,
        ko: String,
        ja: String,
      },
      metaDescription: {
        en: String,
        vi: String,
        ko: String,
        ja: String,
      },
      ogImage: String,
      keywords: [String],
    },

    isPublished: { type: Boolean, default: false, index: true },
    isFeatured: { type: Boolean, default: false },
    publishedAt: { type: Date, default: null },
    readTime: { type: Number, default: 5 },
    viewCount: { type: Number, default: 0 },
    order: { type: Number, default: 0 },
    relatedSlugs: [String],
  },
  { timestamps: true }
);

// Compound index for public listing queries
BlogPostSchema.index({ isPublished: 1, publishedAt: -1 });
BlogPostSchema.index({ isPublished: 1, category: 1 });

export default mongoose.model<IBlogPost>("BlogPost", BlogPostSchema);
