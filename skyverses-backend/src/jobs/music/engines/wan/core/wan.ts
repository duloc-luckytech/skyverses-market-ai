// types/wan.ts
export interface PredictWanI2VOptions {
    prompt: string;
    imageUrl: string;
    token: string; // DashScope API key
    duration?: number; // seconds
    resolution?: "480P" | "720P" | "1080P";
    audio?: boolean;
    shotType?: "single" | "multi";
  }
  
  export interface PredictWanI2VResult {
    taskId: string;
    status: "PENDING" | "RUNNING" | "SUCCEEDED" | "FAILED";
    videoUrl?: string;
    raw?: any;
  }