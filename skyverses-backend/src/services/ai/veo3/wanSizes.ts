// services/wan/wanSizes.ts
export const WAN_T2V_SIZES = {
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
} as const;

export type WanT2VModel = keyof typeof WAN_T2V_SIZES;
