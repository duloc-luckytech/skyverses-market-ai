import express from "express";
import AIModel from "../models/AIModel.model";
import { authenticate } from "./auth";

const router = express.Router();

import { Schema, model } from "mongoose";

export type AIModelStatus = "active" | "inactive" | "draft";

const AIModelSchema = new Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true, // claude-3-5-sonnet
      index: true,
    },

    name: {
      type: String,
      required: true,
    },

    logoUrl: {
      type: String,
      required: true, // /logos/claude.svg or CDN
    },

    route: {
      type: String,
      required: true, // /models/claude-3-5-sonnet
    },

    description: {
      type: String,
    },

    provider: {
      type: String, // Anthropic, Midjourney, Meta, Runway...
    },

    category: {
      type: String, // text / image / video / multimodal
    },

    order: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["active", "inactive", "draft"],
      default: "active",
      index: true,
    },

    createdBy: {
      type: String, // admin email / userId
    },
  },
  { timestamps: true }
);

// /ai-model/
router.get("/", async (req, res) => {
  const models = await AIModel.find({}).sort({ order: 1 });
  res.json({ data: models });
});

/* ============================
   CREATE
============================ */
router.post("/", async (req, res) => {
  const model = await AIModel.create(req.body);
  res.json({ success: true, data: model });
});

/* ============================
   UPDATE
============================ */
router.put("/:id", async (req, res) => {
  const model = await AIModel.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  res.json({ success: true, data: model });
});

/* ============================
   TOGGLE ACTIVE
============================ */
router.patch("/:id/status", async (req, res) => {
  const { status } = req.body;

  const model = await AIModel.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  );

  res.json({ success: true, data: model });
});

/* ============================
   DELETE
============================ */
router.delete("/:id", async (req, res) => {
  await AIModel.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

export default router;
