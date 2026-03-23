import { Schema, model } from "mongoose";

/* =====================================================
   CREDIT PACKAGE SCHEMA
===================================================== */
const CreditPackageSchema = new Schema(
  {
    /* ================= BASIC ================= */
    code: {
      type: String,
      unique: true,
      required: true, // basic | pro | ultimate | creator
      index: true,
    },

    name: {
      type: String,
      required: true, // Basic / Pro / Ultimate / Creator
    },

    description: {
      type: String, // text dưới title
    },

    /* ================= CREDIT ================= */
    credits: {
      type: Number,
      required: true, // credit gốc / tháng
    },

    bonusPercent: {
      type: Number,
      default: 0, // +15%, +25%
    },

    bonusCredits: {
      type: Number,
      default: 0, // bonus cố định
    },

    /* ================= PRICE ================= */
    price: {
      type: Number,
      required: true, // giá hiện tại
    },

    originalPrice: {
      type: Number, // giá gạch ngang
    },

    currency: {
      type: String,
      default: "USD",
    },

    billingCycle: {
      type: String,
      enum: ["monthly", "annual"],
      default: "monthly",
    },

    billedMonths: {
      type: Number,
      default: 1, // 12 = billed for 12 months
    },

    discountPercent: {
      type: Number, // -85
    },

    /* ================= UI FLAGS ================= */
    popular: {
      type: Boolean,
      default: false,
    },

    highlight: {
      type: Boolean,
      default: false, // viền sáng
    },

    badge: {
      type: String, // "+25% BONUS", "LIMITED OFFER"
    },

    ribbon: {
      text: String,   // MOST POPULAR
      color: String,  // #C7F000
      icon: String,   // 🎁 🔥
    },

    ctaText: {
      type: String,
      default: "Select Plan",
    },

    /* ================= FEATURE LIST ================= */
    features: [
      {
        key: String,        // credits / concurrent / access
        label: String,      // "1,200 credits per month"
        enabled: Boolean,   // ✓ / ✕
        highlight: Boolean, // text neon
        note: String,       // "+ 365 UNLIMITED Nano Banana Pro"
      },
    ],

    /* ================= UNLIMITED MODELS ================= */
    unlimitedModels: [
      {
        modelKey: String,   // nano_banana_pro
        label: String,      // Nano Banana Pro
        badge: String,      // 365 UNLIMITED / 4K / 2K
        enabled: Boolean,
        highlight: Boolean,
      },
    ],

    /* ================= THEME ================= */
    theme: {
      gradientFrom: String, // "#0f172a"
      gradientTo: String,   // "#020617"
      accentColor: String,  // "#C7F000"
      buttonStyle: String,  // neon | solid | pink
    },

    /* ================= STATUS ================= */
    active: {
      type: Boolean,
      default: true,
      index: true,
    },

    /* ================= SORT ================= */
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

/* =====================================================
   VIRTUAL: TOTAL CREDITS
===================================================== */
CreditPackageSchema.virtual("totalCredits").get(function () {
  const bonusFromPercent = Math.floor(
    (this.credits * (this.bonusPercent || 0)) / 100
  );
  return this.credits + bonusFromPercent + (this.bonusCredits || 0);
});

CreditPackageSchema.set("toJSON", { virtuals: true });
CreditPackageSchema.set("toObject", { virtuals: true });

export default model("CreditPackage", CreditPackageSchema);