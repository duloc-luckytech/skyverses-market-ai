// services/wan/wanSizes.ts
import { WanT2VModel } from "./wanModels";

export const WAN_T2V_SIZES: Partial<Record<WanT2VModel, readonly string[]>> = {
  "wan2.6-t2v": [
    // 720P tier
    "1280*720",
    "720*1280",
    "960*960",
    "1088*832",
    "832*1088",

    // 1080P tier
    "1920*1080",
    "1080*1920",
    "1440*1440",
    "1632*1248",
    "1248*1632",
  ],

  "wan2.5-t2v-preview": [
    // 480P
    "832*480",
    "480*832",
    "624*624",

    // 720P
    "1280*720",
    "720*1280",
    "960*960",
  ],
};