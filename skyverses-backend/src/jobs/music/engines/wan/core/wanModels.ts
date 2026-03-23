/**
 * ======================================================
 *  WAN TEXT-TO-VIDEO MODELS
 *  Source of truth cho:
 *  - duration
 *  - size capability
 *  - billing rules
 * ======================================================
 */

export const WAN_T2V_MODELS = {
  /** ✅ Main production model (5 / 10 / 15s, 720p–1080p) */
  T2V_26: "wan2.6-t2v",

  /** 🧪 Preview model (5 / 10s, 480p–720p) */
  T2V_25_PREVIEW: "wan2.5-t2v-preview",

  /** 🔒 Fixed 5s */
  T2V_22_PLUS: "wan2.2-t2v-plus",

  /** 🔒 Fixed 5s */
  T2V_21_PLUS: "wan2.1-t2v-plus",

  /** ⚡ Turbo (Fixed 5s) */
  T2V_21_TURBO: "wan2.1-t2v-turbo",
} as const;

/**
 * Union type dùng khắp hệ thống
 */
export type WanT2VModel = (typeof WAN_T2V_MODELS)[keyof typeof WAN_T2V_MODELS];

/**
 * Helper – kiểm tra model có cho custom duration không
 */
export function wanSupportsCustomDuration(model: WanT2VModel): boolean {
  return (
    model === WAN_T2V_MODELS.T2V_26 || model === WAN_T2V_MODELS.T2V_25_PREVIEW
  );
}

/**
 * Helper – default duration theo model
 */
export function getWanDefaultDuration(model: WanT2VModel): number {
  switch (model) {
    case WAN_T2V_MODELS.T2V_26:
    case WAN_T2V_MODELS.T2V_25_PREVIEW:
      return 5;

    default:
      return 5;
  }
}
