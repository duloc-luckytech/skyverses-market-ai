export interface PredictLabsOptions {
  prompt: string;
  quantity?: number;
  freeCredit: boolean;
  aspectRatio?: "VIDEO_ASPECT_RATIO_LANDSCAPE" | "VIDEO_ASPECT_RATIO_PORTRAIT";
  modelKey?: string;
  seed?: number;
  token: string;
  projectId: string;
}

export interface PredictLabsResult {
  operation: { name: string };
  sceneId: string;
  status: string;
}
