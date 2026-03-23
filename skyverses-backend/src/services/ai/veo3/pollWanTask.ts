// services/wan/pollWanTask.ts
import axios from "axios";

export type WanTaskStatus =
  | "PENDING"
  | "RUNNING"
  | "SUCCEEDED"
  | "FAILED"
  | "CANCELED"
  | "UNKNOWN";

export interface WanPollResult {
  taskId: string;
  status: WanTaskStatus;
  videoUrl?: string;
  submitTime?: string;
  scheduledTime?: string;
  endTime?: string;
  usage?: {
    duration?: number;
    outputVideoDuration?: number;
    resolution?: number;
    videoCount?: number;
  };
  error?: any;
  raw?: any;
}

export async function pollWanTask(
  taskId: string,
  apiKey: string
): Promise<WanPollResult> {
  try {
    const res = await axios.get(
      `https://dashscope-intl.aliyuncs.com/api/v1/tasks/${taskId}`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        timeout: 60_000,
      }
    );

    const output = res.data?.output;
    const usage = res.data?.usage;

    if (!output || !output.task_status) {
      return {
        taskId,
        status: "UNKNOWN",
        raw: res.data,
      };
    }

    const status = output.task_status as WanTaskStatus;

    switch (status) {
      case "SUCCEEDED":
        return {
          taskId: output.task_id,
          status,
          videoUrl: output.video_url,
          submitTime: output.submit_time,
          scheduledTime: output.scheduled_time,
          endTime: output.end_time,
          usage: {
            duration: usage?.duration,
            outputVideoDuration: usage?.output_video_duration,
            resolution: usage?.SR,
            videoCount: usage?.video_count,
          },
          raw: res.data,
        };

      case "FAILED":
      case "CANCELED":
        return {
          taskId: output.task_id,
          status,
          submitTime: output.submit_time,
          scheduledTime: output.scheduled_time,
          endTime: output.end_time,
          error: output?.error,
          raw: res.data,
        };

      case "PENDING":
      case "RUNNING":
        return {
          taskId: output.task_id,
          status,
          submitTime: output.submit_time,
          scheduledTime: output.scheduled_time,
          raw: res.data,
        };

      default:
        return {
          taskId,
          status: "UNKNOWN",
          raw: res.data,
        };
    }
  } catch (err: any) {
    // ❗ API 404 / 410 / network → xem như UNKNOWN
    return {
      taskId,
      status: "UNKNOWN",
      error: err?.response?.data || err?.message,
    };
  }
}