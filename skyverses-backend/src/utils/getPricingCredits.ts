import ModelPricingMatrix from "../models/ModelPricingMatrix.model";

interface GetPricingCreditsParams {
  pricingId?: string;
  engine?: string;
  modelKey: string;
  version?: string;

  resolution: string;
  duration?: number;
  mode?: string;
}

/* =====================================================
   NORMALIZE HELPERS
===================================================== */
function normalizeKey(value: string): string {
  return String(value).trim().toLowerCase();
}

/* =====================================================
   GET PRICING CREDITS
   
   Supports two pricing formats:
   1. Duration-based: { "720p": { "5": 500, "8": 800 } }
   2. Mode-based:     { "720p": { "fast": 1000, "quality": 4000 } }
===================================================== */
export async function getPricingCredits({
  engine,
  modelKey,
  resolution,
  duration,
  mode,
}: GetPricingCreditsParams) {
  /* ================= FIND CONFIG ================= */
  const query: any = { modelKey };
  if (engine) query.engine = engine;

  const cfg = await ModelPricingMatrix.findOne(query).lean();

  if (!cfg) {
    throw {
      code: "PRICING_CONFIG_NOT_FOUND",
      query,
    };
  }

  /* ================= NORMALIZE RESOLUTION ================= */
  const resolutionKey = normalizeKey(resolution);

  /* ================= VALIDATE RESOLUTION ================= */
  let resolutionMap = cfg.pricing?.[resolutionKey];

  // Fallback: if resolution not found, try 'default' key (legacy models)
  if (!resolutionMap && cfg.pricing?.['default']) {
    resolutionMap = cfg.pricing['default'];
  }

  if (!resolutionMap) {
    throw {
      code: "RESOLUTION_NOT_FOUND",
      resolution: resolutionKey,
      available: Object.keys(cfg.pricing || {}),
    };
  }

  /* ================= LOOKUP CREDITS ================= */
  // Try duration first (e.g. "5", "8", "10")
  let credits = duration != null ? resolutionMap[String(duration)] : undefined;

  // Fallback: try mode (e.g. "fast", "quality", "relaxed")
  if (credits == null && mode) {
    credits = resolutionMap[normalizeKey(mode)];
  }

  // Fallback: try first available key (single-price models)
  if (credits == null) {
    const keys = Object.keys(resolutionMap);
    if (keys.length === 1) {
      credits = resolutionMap[keys[0]];
    }
  }

  if (credits == null) {
    throw {
      code: "PRICING_KEY_NOT_FOUND",
      resolution: resolutionKey,
      duration,
      mode,
      available: Object.keys(resolutionMap),
    };
  }

  return credits;
}