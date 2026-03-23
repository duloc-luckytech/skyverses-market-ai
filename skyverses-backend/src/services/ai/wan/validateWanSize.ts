import { WAN_T2V_SIZES } from "./wanSizes";
import { WanT2VModel } from "./wanModels";

export function validateWanSize(model: WanT2VModel, size: string) {
  const allowed = WAN_T2V_SIZES[model];

  if (!allowed.includes(size as any)) {
    throw new Error(
      `Invalid size "${size}" for model ${model}. ` +
        `Allowed sizes: ${allowed.join(", ")}`
    );
  }
}
