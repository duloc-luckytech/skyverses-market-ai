import { Schema, model } from "mongoose";

/* =====================================================
   PROMO BANNER SCHEMA — hero banners for MarketsPage
===================================================== */
const PromoBannerSchema = new Schema(
  {
    tag: {
      type: String,
      required: true, // HOT DEAL, MỚI, FLASH SALE...
    },

    heroTitle: {
      type: String,
      required: true, // "Nâng cấp "
    },

    heroHighlight: {
      type: String,
      required: true, // "gói Pro giảm 30%"
    },

    heroDesc: {
      type: String,
      required: true, // subtitle dưới h1
    },

    title: {
      type: String,
      required: true, // promo strip title
    },

    desc: {
      type: String,
      required: true, // promo strip description
    },

    cta: {
      type: String,
      required: true, // button text
      default: "Xem ngay",
    },

    link: {
      type: String,
      required: true, // navigate path
      default: "/pricing",
    },

    active: {
      type: Boolean,
      default: true,
      index: true,
    },

    imageUrl: {
      type: String,
      default: '', // Cloudflare Images URL for hero banner background
    },

    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default model("PromoBanner", PromoBannerSchema);
