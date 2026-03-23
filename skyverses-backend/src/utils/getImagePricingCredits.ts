import ModelPricingMatrix from "../models/ModelPricingMatrix.model";

interface GetImagePricingCreditsParams {
  engine: string; // gommo
  modelKey: string; // google_image_gen_banana_pro
  version?: string; // optional (3.1)
  resolution: string; // 1k | 2k | 4k
  steps: number; // 0
}

export async function getImagePricingCredits({
  engine,
  modelKey,
  resolution,
  steps = 0,
}: GetImagePricingCreditsParams): Promise<number> {
  /* ================= FIND CONFIG ================= */
  const query: any = {
    tool: "image",
    engine,
    modelKey,
    status: "active",
  };

  const cfg = await ModelPricingMatrix.findOne(query).lean();

  if (!cfg) {
    throw {
      code: "IMAGE_PRICING_NOT_FOUND",
      query,
    };
  }

  /* ================= NORMALIZE ================= */
  const resKey = String(resolution).toLowerCase();
  const stepKey = String(steps);

  /* ================= RESOLUTION ================= */
  const resolutionMap = cfg.pricing?.[resKey];
  if (!resolutionMap) {
    throw {
      code: "IMAGE_RESOLUTION_NOT_FOUND",
      resolution: resKey,
      available: Object.keys(cfg.pricing || {}),
    };
  }

  /* ================= STEPS ================= */
  const credits = resolutionMap[stepKey];
  if (credits == null) {
    throw {
      code: "IMAGE_STEPS_NOT_FOUND",
      resolution: resKey,
      steps,
      available: Object.keys(resolutionMap),
    };
  }

  return credits;
}
