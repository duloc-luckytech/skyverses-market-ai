import { Schema, model, Document } from "mongoose";

/* =========================
   SUB CATEGORY
========================= */
export interface ISubCategory {
  code: string; // GAME_PROTOTYPING
  name: string; // Game Prototyping
  services: string[]; // services / tags
}

/* =========================
   CATEGORY
========================= */
export interface ICategory extends Document {
  code: string; // ALL, GAMES, ART_DESIGN...
  name: string; // Games, Art & Design...
  description?: string;
  order: number;
  status: "active" | "inactive";
  subCategories: ISubCategory[];
  createdAt: Date;
  updatedAt: Date;
}

const SubCategorySchema = new Schema(
  {
    code: { type: String, required: true },
    name: { type: String, required: true },
    services: { type: [String], default: [] },
  },
  { _id: false }
);

const CategorySchema = new Schema<ICategory>(
  {
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: String,
    order: { type: Number, default: 0 },
    status: { type: String, enum: ["active", "inactive"], default: "active" },

    subCategories: { type: [SubCategorySchema], default: [] },
  },
  { timestamps: true }
);

export default model<ICategory>("Category", CategorySchema);
