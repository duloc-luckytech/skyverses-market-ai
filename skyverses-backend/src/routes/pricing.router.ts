import express from "express";
import ModelPricingMatrix from "../models/ModelPricingMatrix.model";
import { buildPricingMatrix } from "../utils/buildPricingMatrix";

const router = express.Router();

function normalizeResolutions(
  resolutions: string[] | string | Record<string, number>
): Record<string, number> {
  // FE gửi: ["720p","1080p"]
  if (Array.isArray(resolutions)) {
    return resolutions.reduce((acc, r) => {
      acc[String(r).trim()] = 1; // default multiplier = 1x
      return acc;
    }, {} as Record<string, number>);
  }

  // FE cũ: "720p,1080p"
  if (typeof resolutions === "string") {
    return resolutions
      .split(",")
      .map((r) => r.trim())
      .filter(Boolean)
      .reduce((acc, r) => {
        acc[r] = 1;
        return acc;
      }, {} as Record<string, number>);
  }

  // Advanced: { "720p": 1, "1080p": 1.5 }
  if (typeof resolutions === "object" && resolutions !== null) {
    return resolutions;
  }

  throw new Error("INVALID_RESOLUTIONS_FORMAT");
}

/**
 * @swagger
 * tags:
 *   name: Pricing
 *   description: Pricing Matrix management
 */

/* =====================================================
   GET PRICING MATRIX
===================================================== */
/**
 * @swagger
 * /pricing:
 *   get:
 *     summary: Get pricing matrix list
 *     tags: [Pricing]
 *     parameters:
 *       - in: query
 *         name: tool
 *         schema:
 *           type: string
 *           enum: [video, image]
 *       - in: query
 *         name: engine
 *         schema:
 *           type: string
 *           example: gommo
 *       - in: query
 *         name: modelKey
 *         schema:
 *           type: string
 *           example: veo_3_1
 *       - in: query
 *         name: version
 *         schema:
 *           type: string
 *           example: "3.0"
 *     responses:
 *       200:
 *         description: Pricing matrix list
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PricingMatrix'
 */
router.get("/", async (req, res) => {
  const { engine, modelKey, version, tool } = req.query;

  const filter: any = {};
  if (tool) filter.tool = tool;
  if (engine) filter.engine = engine;
  if (modelKey) filter.modelKey = modelKey;
  if (version) filter.version = version;

  const list = await ModelPricingMatrix.find(filter).sort({
    modelKey: 1,
    version: -1,
  });

  res.json(list);
});

/* =====================================================
   LOOKUP CREDIT (O(1))
===================================================== */
/**
 * @swagger
 * /pricing/lookup:
 *   get:
 *     summary: Lookup credits (O(1))
 *     tags: [Pricing]
 *     parameters:
 *       - in: query
 *         name: engine
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: modelKey
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: version
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: resolution
 *         required: true
 *         schema:
 *           type: string
 *           example: 1080p
 *       - in: query
 *         name: duration
 *         required: true
 *         schema:
 *           type: number
 *           example: 8
 *     responses:
 *       200:
 *         description: Credit lookup result
 */
router.get("/lookup", async (req, res) => {
  const { engine, modelKey, version, resolution, duration } = req.query;

  if (!engine || !modelKey || !version || !resolution || !duration) {
    return res.status(400).json({ error: "MISSING_PARAMS" });
  }

  const cfg = await ModelPricingMatrix.findOne({
    engine,
    modelKey,
    version,
    status: "active",
  });

  if (!cfg) {
    return res.status(404).json({ error: "MODEL_NOT_FOUND" });
  }

  const credits = cfg.pricing?.[resolution as string]?.[String(duration)];

  if (credits == null) {
    return res.status(404).json({ error: "PRICING_NOT_FOUND" });
  }

  res.json({
    engine,
    modelKey,
    version,
    resolution,
    duration: Number(duration),
    credits,
  });
});

/* =====================================================
   UPDATE PRICING (ADMIN)
===================================================== */
/**
 * @swagger
 * /pricing/{id}:
 *   put:
 *     summary: Update pricing config & rebuild matrix
 *     tags: [Pricing]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - baseCredits
 *               - perSecond
 *               - resolutions
 *               - durations
 *             properties:
 *               name:
 *                 type: string
 *               mode:
 *                 type: string
 *               baseCredits:
 *                 type: number
 *               defaultDuration:
 *                 type: number
 *               perSecond:
 *                 type: number
 *               resolutions:
 *                 type: object
 *               durations:
 *                 type: array
 *                 items:
 *                   type: number
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 */
router.put("/:id", async (req, res) => {
  const { id } = req.params;

  const {
    name,
    mode,
    modes,
    aspectRatios,

    baseCredits,
    defaultDuration = 4,
    perSecond,
    resolutions, // 🔥 OBJECT MAP
    durations,
    modelKey,

    description,
    status,
  } = req.body;

  /* ================= VALIDATION ================= */
  if (
    typeof baseCredits !== "number" ||
    typeof perSecond !== "number" ||
    typeof resolutions !== "object" ||
    resolutions === null ||
    !Array.isArray(durations)
  ) {
    return res.status(400).json({
      error: "INVALID_PRICING_PARAMS",
      hint: "resolutions must be object: { '720p': 1, '1080p': 1.5 }",
    });
  }

  const cfg = await ModelPricingMatrix.findById(id);
  if (!cfg) {
    return res.status(404).json({
      error: "PRICING_CONFIG_NOT_FOUND",
    });
  }

  /* ================= BUILD MATRIX ================= */
  const { basePricing, pricing } = buildPricingMatrix({
    baseCredits,
    defaultDuration,
    perSecond,
    resolutions, // ✅ TRUYỀN THẲNG
    durations,
  });

  /* ================= APPLY UPDATE ================= */
  cfg.basePricing = basePricing;
  cfg.pricing = pricing;
  cfg.modes = modes;
  cfg.modelKey = modelKey;
  cfg.aspectRatios = aspectRatios;
  

  if (name !== undefined) cfg.name = name;
  if (mode !== undefined) cfg.mode = mode;
  if (description !== undefined) cfg.description = description;
  if (status !== undefined) cfg.status = status;

  cfg.markModified("basePricing");
  cfg.markModified("pricing");
  await cfg.save();

  res.json({
    success: true,
    id: cfg._id,
    engine: cfg.engine,
    modelKey: cfg.modelKey,
    version: cfg.version,
    basePricing,
    pricing,
  });
});
/* =====================================================
   ADD NEW PRICING CONFIG (ADMIN)
===================================================== */
/**
 * @swagger
 * /pricing:
 *   post:
 *     summary: Create new pricing config
 *     tags: [Pricing]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tool
 *               - engine
 *               - modelKey
 *               - version
 *               - baseCredits
 *               - perSecond
 *               - resolutions
 *               - durations
 */
router.post("/", async (req, res) => {
  const {
    tool,
    engine,
    modelKey,
    version,
    name,
    modes,
    mode,
    baseCredits,
    defaultDuration = 5,
    perSecond,
    resolutions,
    durations,
    description,
    status = "active",
    aspectRatios
  } = req.body;

  if (
    !tool ||
    !engine ||
    !modelKey ||
    !version ||
    typeof baseCredits !== "number" ||
    typeof perSecond !== "number" ||
    !resolutions ||
    !Array.isArray(durations)
  ) {
    return res.status(400).json({ error: "INVALID_CREATE_PARAMS" });
  }

  const existed = await ModelPricingMatrix.findOne({
    tool,
    engine,
    modelKey,
    version,
  });

  if (existed) {
    return res.status(409).json({ error: "PRICING_ALREADY_EXISTS" });
  }

  const { basePricing, pricing } = buildPricingMatrix({
    baseCredits,
    defaultDuration,
    perSecond,
    resolutions,
    durations,
  });

  const doc = await ModelPricingMatrix.create({
    tool,
    engine,
    modelKey,
    version,
    aspectRatios,
    name,
    mode,
    modes,
    description,
    status,
    basePricing,
    pricing,
  });

  res.json({
    success: true,
    id: doc._id,
    basePricing: doc.basePricing,
    pricing: doc.pricing,
  });
});

router.patch("/:id/cell", async (req, res) => {
  const { id } = req.params;
  const { resolution, duration, credits } = req.body;

  /* ================= VALIDATION ================= */
  if (
    !resolution ||
    typeof duration !== "number" ||
    typeof credits !== "number"
  ) {
    return res.status(400).json({
      error: "INVALID_CELL_PARAMS",
      required: {
        resolution: "string",
        duration: "number",
        credits: "number",
      },
    });
  }

  const cfg = await ModelPricingMatrix.findById(id);
  if (!cfg) {
    return res.status(404).json({
      error: "PRICING_CONFIG_NOT_FOUND",
    });
  }

  if (!cfg.pricing?.[resolution]) {
    return res.status(404).json({
      error: "RESOLUTION_NOT_FOUND",
      resolution,
    });
  }

  if (cfg.pricing[resolution][String(duration)] == null) {
    return res.status(404).json({
      error: "DURATION_NOT_FOUND",
      resolution,
      duration,
    });
  }

  /* ================= UPDATE CELL ================= */
  cfg.pricing[resolution][String(duration)] = credits;

  // ⭐ đảm bảo mongoose nhận biết object deep thay đổi
  cfg.markModified("pricing");

  await cfg.save();

  res.json({
    success: true,
    id: cfg._id,
    updated: {
      resolution,
      duration,
      credits,
    },
  });
});

/* =====================================================
   DELETE PRICING CONFIG (ADMIN)
===================================================== */
/**
 * @swagger
 * /pricing/{id}:
 *   delete:
 *     summary: Delete pricing config
 *     tags: [Pricing]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Pricing config deleted
 */
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  const cfg = await ModelPricingMatrix.findById(id);
  if (!cfg) {
    return res.status(404).json({
      error: "PRICING_CONFIG_NOT_FOUND",
    });
  }

  await cfg.deleteOne();

  res.json({
    success: true,
    deletedId: id,
    engine: cfg.engine,
    modelKey: cfg.modelKey,
    version: cfg.version,
  });
});
export default router;
