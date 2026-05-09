import { Schema, model } from "mongoose";

const SkyTokenPackageSchema = new Schema(
  {
    code: { type: String, unique: true, required: true }, // "skt_100", "skt_500"
    name: { type: String, required: true },
    tokens: { type: Number, required: true }, // số SKT nhận được
    price: { type: Number, required: true }, // giá VND
    originalPrice: { type: Number, default: null }, // giá gạch
    bonusPercent: { type: Number, default: 0 },
    bonusTokens: { type: Number, default: 0 },
    badge: { type: String, default: null },
    popular: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

SkyTokenPackageSchema.virtual("totalTokens").get(function () {
  return this.tokens + (this.bonusTokens || 0);
});

export default model("SkyTokenPackage", SkyTokenPackageSchema);
