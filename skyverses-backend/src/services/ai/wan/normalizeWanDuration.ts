// services/wan/normalizeWanDuration.ts
import { WanT2VModel } from "./wanModels";

export function normalizeWanDuration(
  model: WanT2VModel,
  duration?: number
): number {
  switch (model) {
    case "wan2.6-t2v":
      return [5, 10, 15].includes(duration ?? 5) ? duration ?? 5 : 5;

    case "wan2.5-t2v-preview":
      return [5, 10].includes(duration ?? 5) ? duration ?? 5 : 5;

    case "wan2.2-t2v-plus":
    case "wan2.1-t2v-plus":
    case "wan2.1-t2v-turbo":
      return 5;

    default:
      return 5;
  }
}