// config/plans.ts

export interface PlanConfig {
  key: string;
  title: string;
  price: string;
  badge?: string;
  perks: string[];
  maxDuration: number; // seconds
  maxVideo: number;
  maxPrompt: number;
  videoPerMinute: number;
  expire: number;
}

export const MAX_VIDEO_PLAN: any = {
  free: {
    maxVideo: 200,
  },
  trial: {
    maxVideo: 200,
  },
  plan1: {
    maxVideo: 4000,
  },
  plan2: {
    maxVideo: 8500,
  },
};
