export const PLAN_LIMITS: Record<string, number> = {
  free: 1,
  trial: 1,
  plan1: 1,
  plan2: 1,
};

// config/systemConfig.ts

export const SYSTEM_CONFIG = {
  projectExpireHours: 8, // Project auto delete sau 8 giờ
  videoExpireHours: 8, // VideoJobs auto delete sau 8 giờ
  imageExpireHours: 8, // Images auto delete sau 8 giờ
};

export const REJECT_ERRORS = [
  "PUBLIC_ERROR_PROMINENT_PEOPLE_FILTER_FAILED",
  "PUBLIC_ERROR_MINOR_UPLOAD",
  "PUBLIC_ERROR_MINOR",
  "PUBLIC_ERROR_UNSAFE_GENERATION",
  "PUBLIC_ERROR_SEXUAL",
];

export const RETRY_WHEN_HIGH_TRAFFIC = [
  "PUBLIC_ERROR_HIGH_TRAFFIC",
  "PUBLIC_ERROR_RATE_LIMIT",
];

